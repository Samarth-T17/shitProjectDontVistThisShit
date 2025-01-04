import linkedIn from "linkedin-jobs-api";
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import "dotenv/config";

const token = process.env.API_KEY;
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "Meta-Llama-3.1-405B-Instruct";

module.exports = async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed. Use GET." });
    }

    const { keyword, minSalary, experienceLevel, ageRange, extraPrompt } = req.query;

    const queryOptions = {
        keyword: keyword || "software engineer",
        location: "India",
        dateSincePosted: "past Week",
        jobType: "full time",
        remoteFilter: "remote",
        salary: minSalary || "100000",
        experienceLevel: experienceLevel || "entry level",
        limit: "10",
        page: "0",
    };

    try {
        // Fetch LinkedIn Jobs
        const linkedInJobs = await linkedIn.query(queryOptions);
        const validJobs = linkedInJobs.filter(job => job && job.position && job.company);

        const newArray = validJobs.map((item, index) => ({
            position: item.position,
            index,
            salary: item.salary || "Not specified",
            company: item.company || "Unknown company",
        }));

        const [minAge, maxAge] = (ageRange || "").split("-").map(Number);

        const client = new ModelClient(
            endpoint,
            new AzureKeyCredential(token)
        );

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    {
                        role: "system",
                        content: "Your task is to filter these jobs based on the following criteria: Return a comma-separated list of the job indices that match these criteria. If no jobs match, return at least 1 index."
                    },
                    {
                        role: "user",
                        content: `Here is the age range and additional user information: 
                      - Age range: ${minAge || 0}-${maxAge || 100}
                      - Experience level: ${experienceLevel || "entry level"} 
                      - Additional requirements: ${extraPrompt || "None"}
                      Here is a list of job opportunities: ${JSON.stringify(newArray)}`
                    }
                ],
                temperature: 1.0,
                top_p: 1.0,
                max_tokens: 1000,
                model: modelName
            }
        });

        const responseText = response.body.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error("Gemini API returned an empty response");
        }

        const arr = responseText
            .replace(/\s+/g, "")
            .split(",")
            .map(num => parseInt(num, 10))
            .filter(item => !Number.isNaN(item));

        const filteredArray = arr.map(index => validJobs[index]).filter(job => job);

        if (filteredArray.length === 0) {
            return res.json([validJobs[0], validJobs[2], validJobs[5]]); // Fallback: Return some jobs
        }

        return res.json(filteredArray);
    } catch (error) {
        console.error("Error fetching jobs:", error.message);
        return res.status(500).json({ error: "Failed to fetch jobs. Please try again later." });
    }
};
