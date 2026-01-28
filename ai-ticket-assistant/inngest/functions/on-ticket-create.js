import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      //fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticket) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      // Optionally update status immediately if desired
      // await step.run("update-ticket-status-to-pending", async () => {
      //   await Ticket.findByIdAndUpdate(ticket._id, { status: "PENDING_AI" });
      // });

      // Run AI Analysis
      const aiResponse = await step.run("ai-processing", async () => {
         const analysis = await analyzeTicket(ticket);
         if (!analysis || !analysis.priority || !analysis.relatedSkills) {
             console.warn("AI analysis failed or returned incomplete data for ticket:", ticket._id);
             // Decide on fallback behavior: maybe assign default priority/skills or fail
             // For now, let's assign medium priority and empty skills as a fallback
             return {
                 priority: 'medium',
                 helpfulNotes: analysis?.helpfulNotes || 'AI analysis could not provide detailed notes.',
                 relatedSkills: analysis?.relatedSkills || [],
                 summary: analysis?.summary || 'AI analysis could not provide a summary.'
             };
         }
         return analysis;
      });


      // Update ticket with AI results
       const relatedSkills = await step.run("update-ticket-with-ai-data", async () => {
         await Ticket.findByIdAndUpdate(ticket._id, {
           summary: aiResponse.summary, // Assuming summary is part of aiResponse now
           priority: !["low", "medium", "high"].includes(aiResponse.priority)
             ? "medium" // Default if invalid value
             : aiResponse.priority,
           helpfulNotes: aiResponse.helpfulNotes,
           status: "TODO", // Set status to TODO after processing, ready for assignment
           relatedSkills: aiResponse.relatedSkills,
         });
         return aiResponse.relatedSkills; // Pass skills to the next step
       });


      const moderator = await step.run("assign-moderator", async () => {
        let assignedUser = null;
        if (relatedSkills && relatedSkills.length > 0) {
            // Escape skills for regex safety
            const escapedSkillsRegex = relatedSkills.map(escapeRegex).join("|");
             assignedUser = await User.findOne({
               role: "moderator",
               skills: {
                 $elemMatch: {
                   $regex: escapedSkillsRegex,
                   $options: "i", // Case-insensitive matching
                 },
               },
             });
        }

        // Fallback to admin if no suitable moderator found
        if (!assignedUser) {
          assignedUser = await User.findOne({ role: "admin" });
        }

        // Update ticket assignment and status
        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: assignedUser?._id || null, // Handle case where even admin isn't found
          status: assignedUser ? "IN_PROGRESS" : "TODO", // Keep as TODO if unassigned
        });

        return assignedUser; // Return the assigned user (or null)
      });

      // Corrected typo: setp -> step
      await step.run("send-email-notification", async () => {
        if (moderator) {
          // Fetch the final ticket state *after* assignment
          const finalTicket = await Ticket.findById(ticket._id);
          if (finalTicket) { // Check if ticket still exists
              await sendMail(
                moderator.email,
                `Ticket Assigned: ${finalTicket.title}`, // More descriptive subject
                `A new ticket "${finalTicket.title}" has been assigned to you.\n\nDescription: ${finalTicket.description}\n\nPriority: ${finalTicket.priority}\nHelpful Notes: ${finalTicket.helpfulNotes || 'N/A'}` // Include more details
              );
          } else {
              console.warn(`Ticket ${ticket._id} not found when trying to send notification.`);
          }
        } else {
             console.log(`Ticket ${ticket._id} could not be assigned, no notification sent.`);
             // Optionally: Notify an admin or a default address that assignment failed
        }
      });

      console.log(`Successfully processed ticket ${ticket._id}`);
      return { success: true, ticketId: ticket._id };
    } catch (err) {
      console.error(`❌ Error processing ticket ${event?.data?.ticketId}:`, err.message);
      // Re-throw to use Inngest's retry mechanism
      throw err;
      // return { success: false, error: err.message }; // Avoid this if you want retries
    }
  }
);