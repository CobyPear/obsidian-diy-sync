> Why did you build this?

I am still a relatively new developer and I wanted to cut my teeth on a backend focused project. I also love using Obsidian.md for my notes and while there are other (likely better) sync options out there, I wanted to create my own 'publish and sync' solution. I ended up with this Obsidian plugin + express server.

> What does it do?

There are two pieces of this project.

1. A node.js server
2. An Obsidian.md plugin
   Both are written in TypeScript and the projects live inside of the same monorepo.
   It is possible to run everything locally-- the plugin can be symlinked to an Obsidian vault and installed as a community plugin. From there you set your endpoint. Then, you may create a user and sync your vault to the server.

The server can have any number of users, and each user can have any number of vaults. Upper limits are likely bound to SQLite, or Node/express constraints. For example, a vault with a lot of nodes will be too large to sync with the server. (I am looking into ways to make it possible to sync a vault of any size and I am open to suggestions!)

### The Blog Route

The sugar on top is the `/api/blog` route that comes with the server. Any post with frontmatter `published: true` or a hashtag #published will automatically be served at this route. That way you can use Obsidian as sort of a rudimentary CMS or at least blog editing station. Ready to publish? Add the tag and sync your vault. If you use SSR on your frontend to consume this API route your blog will be updated as fast as the bytes can cross the wire.

> Why should I care?

I'm not sure if you should! If you want to create a [digital garden](https://tomcritchlow.com/2019/02/17/building-digital-garden/) of your own, I think this is a nice way to handle some of the backend. That way you can focus on the content and the frontend goodness instead of fighting with servers all day.
