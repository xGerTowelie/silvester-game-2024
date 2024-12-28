import fs from 'fs/promises';

async function analyzeConfidences() {
    try {
        // Read the merged confidences file
        const data = JSON.parse(await fs.readFile('confidences.json', 'utf8'));

        // Function to calculate the gap between GPT and Claude confidences
        const calculateGap = (item) => {
            return Math.abs(item.confidence.gpt - item.confidence.claude);
        };

        // Function to get the lowest confidence for an item
        const getLowestConfidence = (item) => {
            return Math.min(item.confidence.gpt, item.confidence.claude);
        };

        // Sort data by gap (descending) and get top 5
        const topGaps = [...data.questions]
            .sort((a, b) => calculateGap(b) - calculateGap(a))
            .slice(0, 5);

        // Sort data by lowest confidence (ascending) and get bottom 5
        const lowestConfidences = [...data.questions]
            .sort((a, b) => getLowestConfidence(a) - getLowestConfidence(b))
            .slice(0, 5);

        // Prepare results
        const results = {
            topGaps: topGaps.map(item => ({
                id: item.id,
                gptConfidence: item.confidence.gpt,
                claudeConfidence: item.confidence.claude,
                gap: calculateGap(item)
            })),
            lowestConfidences: lowestConfidences.map(item => ({
                id: item.id,
                gptConfidence: item.confidence.gpt,
                claudeConfidence: item.confidence.claude,
                lowestConfidence: getLowestConfidence(item)
            }))
        };

        // Write results to a new JSON file
        await fs.writeFile('confidence_analysis.json', JSON.stringify(results, null, 2));

        console.log('Analysis results have been saved to confidence_analysis.json');

        // Log results to console
        console.log('\nTop 5 objects with biggest confidence gaps:');
        console.table(results.topGaps);

        console.log('\nTop 5 objects with lowest single confidence:');
        console.table(results.lowestConfidences);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Run the analysis
analyzeConfidences();


