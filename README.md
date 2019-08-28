# Prisma2 PubSub Example

Example subscriptions based off the prisma2 boilerplate and Ben Awad's video tutorial https://youtu.be/146AypcFvAU

## How to use

### 1. Subscribe to new published posts

```graphql
subscription {
  publishedPost {
    title,
    content,
    published
  }
}
```

### 2. Create new draft post

```graphql
mutation {
  createDraft(
    title: "Prisma Pubsub", 
    content: "Subscriptions be working!"
    authorEmail: "prisma@subscriptions.com"
  ) {
    id,
    title
  }
}
# {
#   "data": {
#     "createDraft": {
#       "id": "cjzvn2ckk0000sos951nxi6q1",
#       "title": "Prisma Pubsub"
#     }
#   }
# }
```

### 3. Publish draft post

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
#       "title": "Prisma Pubsub"
#     }
#   }
# }
```

### 4. See the results in your subscription

```graphql
# {
#   "data": {
#     "publishedPost": {
#       "title": "Prisma Pubsub",
#       "content": "Subscriptions be working!",
#       "published": true
#     }
#   }
# }
```