import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2, triggers: [{ event: "user/signup" }] },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      console.log("Processing signup for email:", email);
      
      const user = await step.run("get-user-email", async () => {
        // Use case-insensitive search for robustness
        const userObject = await User.findOne({ 
          email: { $regex: new RegExp(`^${email}$`, "i") } 
        });
        
        if (!userObject) {
          console.error("User lookup failed for email:", email);
          throw new NonRetriableError(`User with email ${email} no longer exists in our database`);
        }
        return userObject.toObject();
      });

      // Corrected typo: setp -> step
      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the app`;
        const message = `Hi,
            \n\n
            Thanks for signing up. We're glad to have you onboard!
            `;
        await sendMail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error running signup step", error.message);
      // Ensure errors are propagated correctly for retry logic
      throw error; // Re-throw the error
      // return { success: false }; // Avoid returning success: false if you want retries
    }
  }
);