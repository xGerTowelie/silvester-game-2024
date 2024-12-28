import fs from 'fs/promises';
import path from 'path';

async function mergeRatings() {
    try {
        // Read the JSON files
        const gptData = JSON.parse(await fs.readFile('confidence_gpt.json', 'utf8'));
        const claudeData = JSON.parse(await fs.readFile('confidence_claude.json', 'utf8'));

        // Function to merge ratings
        function combineRatings(gptData, claudeData) {
            const mergedData = claudeData.questions.map(claudeItem => {
                const gptItem = gptData.questions.find(q => q.id === claudeItem.id);
                if (gptItem) {
                    return {
                        id: claudeItem.id,
                        confidence: {
                            claude: claudeItem.confidence.claude,
                            gpt: gptItem.rating
                        }
                    };
                }
                return claudeItem;
            });

            return { questions: mergedData };
        }

        // Merge the ratings
        const mergedRatings = combineRatings(gptData, claudeData);

        // Write the merged data to confidences.json
        await fs.writeFile('confidences.json', JSON.stringify(mergedRatings, null, 2));

        console.log('Merged ratings have been saved to confidences.json');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Run the mergeRatings function
mergeRatings();


