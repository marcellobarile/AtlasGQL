![AtlasGQL](https://i.imgur.com/T0pZSju.jpeg)

This is an example of how easy is to set up a server with AtlasGQL. Feel free go through the few files here and don't hesitate to contact me at marcello.barile@gmail.com in case of further information.

### **Set up**

```
npm i
```

### **Start the server**

```
npm start
```

GraphQL playground available at => http://localhost:3000/graphql

```
query ExampleQuery {
  info {
    startedAt
    version
    name
    uptime
  }
  performances {
    memory
  }
}
```

Types definition available at => http://localhost:3000/static/types

Couldn't be easier, enjoy :-)
