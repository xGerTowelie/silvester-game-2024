import { readFile, writeFile } from 'fs/promises';

async function mergeJsonFiles() {
    try {
        // Read the contents of both files
        const questionsData = JSON.parse(await readFile('all.json', 'utf8'));
        const translationData = JSON.parse(await readFile('translation.json', 'utf8'));

        // Merge the data
        const mergedQuestions = questionsData.questions.map(question => {
            const translation = translationData.questions.find(t => t.id === question.id);
            return {
                ...question,
                question_german: translation ? translation.question : null
            };
        });

        // Create the output object
        const output = { questions: mergedQuestions };

        // Write the merged data to output.json
        await writeFile('output.json', JSON.stringify(output, null, 2));

        console.log('Files merged successfully. Output written to output.json');

        // Display the contents of the output file
        const outputContent = await readFile('output.json', 'utf8');
        console.log('Contents of output.json:');
        console.log(outputContent);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

mergeJsonFiles();
