import fs from 'fs/promises';

async function mergeAll() {
    try {
        // Read the JSON files
        const questions = JSON.parse(await fs.readFile('questions.json', 'utf8'));
        const confidences = JSON.parse(await fs.readFile('confidences.json', 'utf8'));

        // Function to merge ratings
        function combine(questions, confidences) {
            const merged = questions.questions.map(question => {
                const found = confidences.questions.find(q => q.id === question.id);
                if (found) {
                    return {
                        ...question,
                        ...found
                    };
                }
                return question;
            });

            return { questions: merged };
        }

        // Merge the ratings
        const merged = combine(questions, confidences);

        // Write the merged data to confidences.json
        await fs.writeFile('all.json', JSON.stringify(merged, null, 2));

        console.log('Merged Data was written');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Run the mergeRatings function
mergeAll();


