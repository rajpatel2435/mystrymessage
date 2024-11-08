import { z } from "zod";

export const messageSchema = z.object({
    content: z.string().min(10, "Code must be at least 10 characters")
})

// next js is edge runtime
//  means it will run on the edge server when someone send req to the server 