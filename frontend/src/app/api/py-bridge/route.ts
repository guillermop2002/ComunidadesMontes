import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Path to python script
        // In development, services is at root. In production, this needs adjustment.
        // Assuming we run 'npm run dev' from 'frontend' folder, services is '../services'
        const scriptPath = path.resolve(process.cwd(), '../services/api_wrapper.py');

        return new Promise((resolve) => {
            const pythonProcess = spawn('python', [scriptPath]);

            let dataString = '';
            let errorString = '';

            // Send data to python script via stdin
            pythonProcess.stdin.write(JSON.stringify(body));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('Python script error:', errorString);
                    resolve(NextResponse.json({ error: errorString }, { status: 500 }));
                } else {
                    try {
                        const jsonResult = JSON.parse(dataString);
                        resolve(NextResponse.json(jsonResult));
                    } catch (e) {
                        console.error('JSON parse error:', dataString);
                        resolve(NextResponse.json({ error: 'Invalid JSON from Python script', raw: dataString }, { status: 500 }));
                    }
                }
            });
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
