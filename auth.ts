import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
import bcrypt from "bcryptjs"
import  dbConnect  from "@/lib/dbConnect";
import UserModel from "@/model/User";
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req): Promise<any> {
        await dbConnect();

        try {
          const user = await UserModel.findOne({ 
            $or: [
              { username: credentials?.identifier },
              { email: credentials?.identifier },
            ]
         });

         if(!user){
          throw new Error("User not found");
         }

         if(!user.isVerified){
          throw new Error("User is not verified ! Please verify your account first");
         }
          if (user && bcrypt.compareSync(credentials?.password, user.password)) {
            return user;
          }
        } catch (error: any) {
          console.log(error);
          throw new Error(error);
        }
       
      
      },
    }),
  ],
})