const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();



const resolvers = {
    Query: {
        user: async () => {
            return await prisma.user.findMany();
        }
    },
    Mutation: {
        // args works also fine but we take data instid of arg 
        addUser: async (root, data, context, info) => {
            const isUserDuplicate = await prisma.user.findUnique({ where: { email: data.email } })
            if (isUserDuplicate) throw new Error('Email has already been taken by someone else...');

            const user = await prisma.user.create({ data })
            return user
        },
        updateUser: async (root, { id, ...data }, context, info) => {
            const isUserDuplicate = await prisma.user.findUnique({ where: { email: data.email } });
            if (isUserDuplicate && isUserDuplicate.id !== id) {
                throw new Error('Email has already been taken by someone else Please take another');
            }

            const user = await prisma.user.update({
                where: { id },
                //it works also fine but we take sir guide for short the code
                //data:{
                //name: args.name
                //}
                data
            })
            return user
        },
        deleteUser:async(root,{id ,...data},context,info) => {
            const isIdNull = await prisma.user.findUnique ({where: {id}});
            if(id!== isIdNull){ throw new Error("ID is not valid")}
            const user = await prisma.user.delete({
                where: { id },
            })
            return "Deleted"
        },

    }
}


const typeDefs = gql`

type Post {
  id: Int!
  title: String
  content: String
  published: Boolean
  author:[User!]
  authorId:Int
}

type User {
  id:Int!
  email:String!
  name:String
  posts:[Post!]
}

type Query{
    user:[User]
}
type Mutation{
    addUser(email:String!,name:String!):User!
    updateUser(id:Int!,email:String!,name:String!):User!
    deleteUser(id:Int!):String!
}
`;


// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});

