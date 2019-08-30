# Prisma2 PubSub Example

Example subscriptions based off the prisma2 boilerplate and Ben Awad's video tutorial https://youtu.be/146AypcFvAU

## How to use

```
yarn install
yarn start
-> open localhost:4000
```

### 1. Create User

```graphql
mutation{
  signupUser(data: {
    email: "prisma@subscriptions.com",
    name: "Prisma Sub"
  }) {
    email
  }
}
```

### 2. Create New Post

```graphql
mutation {
  createDraft(
    title: "Prisma Subscriptions", 
    content: "Subscriptions are working!"
    authorEmail: "prisma@subscriptions.com"
  ) {
    id,
    title,
    author {
      email
    }
  }
}
# {
#   "data": {
#     "createDraft": {
#       "id": "cjzvn2ckk0000sos951nxi6q1",
#       "title": "Prisma Subscriptions"
#     }
#   }
# }
```

### 3. Subscribe to Published Posts

```graphql
subscription {
  publishedPost {
    title,
    content,
    published,
    author {
      email
    }
  }
}
```

OR filter by email

```graphql
subscription(authorEmail: "prisma@subscriptions.com") {
  publishedPost {
    title,
    content,
    published,
    author {
      email
    }
  }
}
```

### 4. Publish Draft Post (From Step 2)

```graphql
# Make sure to use id from step 2
mutation {
  publish(
    id: "cjzvn2ckk0000sos951nxi6q1"
  ) {
    id,
    title
  }
}
# {
#   "data": {
#     "publish": {
#       "id": "cjzvn2ckk0000sos951nxi6q1",
#       "title": "Prisma Subscriptions"
#     }
#   }
# }
```

### 5. See the results in your subscription!!!

```graphql
# {
#   "data": {
#     "publishedPost": {
#       "title": "Prisma Subscriptions",
#       "content": "Subscriptions are working!",
#       "published": true,
#       "author": {
#         "email": "prisma@subscriptions.com"
#       }
#     }
#   }
# }
```