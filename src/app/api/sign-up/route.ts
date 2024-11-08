import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const existingUserVerifiedByUsername = await UserModel.findOne({ username, isVerified: true });
        if (existingUserVerifiedByUsername) {
            return Response.json({ success: false, message: "Username already exists" }, {
                status: 400
            });
        }

        const existingUserByEmail = await UserModel.findOne({ email });

        if (existingUserByEmail) {

            if (existingUserByEmail.isVerified) {
                return Response.json({ success: false, message: "Email already exists" }, {
                    status: 400
                });
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);

                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

                await existingUserByEmail.save();

            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            // const but we are using new keyword with object to create a new object
            // it is refrencing the meomory and we can change the value inside the object
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpire: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
            });

            await newUser.save();

        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode.toString());

        if (!emailResponse.success) {
            return Response.json({ success: false, message: "Failed to send verification email" }, {
            });
        }


        return Response.json({ success: true, message: "Sign up successful" }, {
            status: 200
        });


    } catch (error) {
        console.log(error);
        return Response.json({ success: false, message: "Failed to sign up" }, {
            status: 500
        });
    }

}