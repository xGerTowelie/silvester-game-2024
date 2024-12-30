import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Question {
    question: string;
    answer: string;
    source: string;
    id: number;
    confidence: {
        claude: number;
        gpt: number;
    };
}

interface QuestionsData {
    questions: Question[];
}

const returnedQuestionIds = new Set<number>();

function calculateHints(answer: string): { hint1: string; hint2: string } {
    // Check if the answer is a range
    const rangeMatch = answer.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(.*)$/);

    let num: number;
    let unit: string = '';

    if (rangeMatch) {
        // If it's a range, use the average
        const [, start, end, rangeUnit] = rangeMatch;
        num = (parseFloat(start) + parseFloat(end)) / 2;
        unit = rangeUnit;
    } else {
        // If it's not a range, use the original parsing
        const match = answer.match(/^([\d,]+(?:\.\d+)?)\s*(.*)$/);
        if (!match) return { hint1: "N/A", hint2: "N/A" };
        num = parseFloat(match[1].replace(/,/g, ''));
        unit = match[2] || '';
    }

    // Calculate random percentages between 1% and 40%
    const percent1 = 1 + Math.random() * 39;
    const percent2 = 1 + Math.random() * 39;

    // Calculate hint values
    const hint1Value = num * (1 - percent1 / 100);
    const hint2Value = num * (1 + percent2 / 100);

    // Format hint values
    const formatHint = (value: number) => {
        // Special case for years - don't use k/million format
        if (answer.match(/^\d{4}$/)) {
            return Math.round(value).toString();
        }

        if (value >= 1000000) {
            return Math.round(value / 1000000) + ' million';
        } else if (value >= 1000) {
            return Math.round(value / 1000) + 'k';
        } else {
            const hasDecimal = answer.includes('.');
            return hasDecimal ? value.toFixed(2) : Math.round(value).toString();
        }
    };

    // For years, swap the hints since a lower year is earlier
    if (answer.match(/^\d{4}$/)) {
        return {
            hint2: `above ${formatHint(hint1Value)} ${unit}`.trim(),
            hint1: `below ${formatHint(hint2Value)} ${unit}`.trim(),
        };
    }

    return {
        hint1: `above ${formatHint(hint1Value)} ${unit}`.trim(),
        hint2: `below ${formatHint(hint2Value)} ${unit}`.trim(),
    };
}


export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'all.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: QuestionsData = JSON.parse(fileContents);

        const availableQuestions = data.questions.filter(q => !returnedQuestionIds.has(q.id));

        if (availableQuestions.length === 0) {
            returnedQuestionIds.clear();
            return NextResponse.json({ message: "All questions have been returned. Cache has been reset." }, { status: 200 });
        }

        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const selectedQuestion = availableQuestions[randomIndex];

        returnedQuestionIds.add(selectedQuestion.id);

        const { hint1, hint2 } = calculateHints(selectedQuestion.answer);

        const questionWithHints = {
            ...selectedQuestion,
            hint1,
            hint2,
        };

        return NextResponse.json(questionWithHints, { status: 200 });
    } catch (error) {
        console.error('Error in random-question API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


