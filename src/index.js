require("dotenv").config();
const { GraphQLServer, PubSub, withFilter } = require('graphql-yoga')
const { join } = require('path')
const { makeSchema, objectType, idArg, stringArg } = require('@prisma/nexus')
const Photon = require('@generated/photon')
const { nexusPrismaPlugin } = require('@generated/nexus-prisma')

const photon = new Photon()
const pubsub = new PubSub()

const nexusPrisma = nexusPrismaPlugin({
  photon: ctx => ctx.photon,
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.posts({
      pagination: false,
    })
  },
})

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.content()
    t.model.createdAt()
    t.model.updatedAt()
    t.model.published()
    t.model.author()
  },
})

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.findOnePost({
      alias: 'post',
    })

    t.list.field('feed', {
      type: 'Post',
      resolve: (parent, args, ctx) => {
        return ctx.photon.posts.findMany({
          where: { published: true },
        })
      },
    })

    t.list.field('filterPosts', {
      type: 'Post',
      args: {
        searchString: stringArg({ nullable: true }),
      },
      resolve: (parent, { searchString }, ctx) => {
        return ctx.photon.posts.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: searchString,
                },
              },
              {
                content: {
                  contains: searchString,
                },
              },
            ],
          },
        })
      },
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.crud.createOneUser({ alias: 'signupUser' })
    t.crud.deleteOnePost()

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        content: stringArg({ nullable: true }),
        authorEmail: stringArg(),
      },
      resolve: (parent, { title, content, authorEmail }, ctx) => {
        return ctx.photon.posts.create({
          data: {
            title,
            content,
            published: false,
            author: {
              connect: { email: authorEmail }
            }
          },
          include: { author: true }
        });
      },
    })

    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: {
        id: idArg(),
      },
      resolve: async (parent, { id }, ctx) => {
        const post = await ctx.photon.posts.update({
          where: { id },
          data: { published: true },
          include: { author: true }
        });
        ctx.pubsub.publish("PUBLISHED_POST", {
          publishedPost: post
        });
        return post
      },
    })
  },
})

const Subscription = objectType({
	name: "Subscription",
	definition(t) {
		t.field("publishedPost", {
			type: "Post",
			subscribe: (parent, args, ctx) =>
				ctx.pubsub.asyncIterator("PUBLISHED_POST")
		});
    t.field("publishedPostWithEmail", {
      type: "Post",
      args: {
        authorEmail: stringArg({ required: false })
      },
      subscribe: withFilter(
        (parent, { authorEmail }, ctx) => ctx.pubsub.asyncIterator("PUBLISHED_POST"),
        (payload, { authorEmail }) => true
      )
    });
	}
});

const schema = makeSchema({
	types: [Query, Mutation, Subscription, Post, User, nexusPrisma],
	outputs: {
		schema: join(__dirname, "/schema.graphql")
	},
	typegenAutoConfig: {
		sources: [
			{
				source: "@generated/photon",
				alias: "photon"
			}
		]
	}
});

const server = new GraphQLServer({
  schema,
  context: request => {
    return {
      ...request,
      photon,
      pubsub
    }
  },
})

server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))
module.exports = { User, Post }
