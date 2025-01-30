# Ship tracking and monitoring app

## Description

This is a demo project for [Coding Factory](https://codingfactory.aueb.gr/). It enables the user to monitor maritime vessels in the Aegean sea, currently.
It leverages websockets and serber sent events for live updates on a vessels position on the map.

It supports login in / sing up using credentials(email/password) or using google's gmail auth. A personalised session is created upon successful sign in /register.

The aim is to add few more features in the future:
- creating personal fleet for easier tracking
- global support for vessel tracking 
- database of vessels,
- user submit ship info

some upgrades to ui as well.

## Build and deploy

The app is developed on Next.js. It is mostly client side rendered but according to react it is better to [start with a framework](https://react.dev/learn/start-a-new-react-project).
This app is using docker to build the app and deploy it to the target environment that supports docker.
The docker file used is according to the Next.js recommendations [here](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile).

How to build it locally :

```bash
docker build . -t nextjs-sse
```

you can change the image tag nextjs-sse to your choice.
then create and run the container : 

```bash
docker run -p 3000:3000 nextjs-sse
``` 
`-p 3000:3000` will map the port 3000 from you local machine to port 3000 inside the docker container.
If the port on you machine is already in use adn an error is thrown, try a different port like : 
```bash
docker run -p 3001:3000 nextjs-sse
``` 

One last thing. The app consumes stream messages from an external service build in this [repo]().

# Misc on the implementation

The app leverages also database also . I chose sqlite though favouring a start simple approach. Currently, I am saving only user registration/sign ups.

here is a simple table created : 
```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT DEFAULT NULL,
    google_id TEXT DEFAULT NULL,
    display_name TEXT,
    created_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
    updated_at DATETIME NOT NULL DEFAULT (DATETIME('now'))
);
```  

[drizzle](https://orm.drizzle.team/) orm was used. I went database first approach so there are no migrations happening.
I am planning to add more features to the app like creating voyage statistics per ship and similar KPIs which means more tables will be added.

In the spirit of learning I chose typescript from the start which added some complexity trying to make the type system work but
the static analysis helped a lot be more confident on the code.

React was chosen as a popular javascript framework. I initially developed the app in both Svelte(Svelte kit) and Vue which 
worked fine as well . The final choice for React was mainly chosen because of the popularity. Also react native seems to have some core concepts of React transferred
so in case someone is interested in mobile development maybe it will be a bit easier.
