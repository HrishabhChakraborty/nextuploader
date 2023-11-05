// pages/api/upload.js
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import mysql from 'mysql2/promise';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '500mb', // Adjust this according to your needs
        },
    },
};

// Convert fs.writeFile to Promise to use async/await
const writeFile = promisify(fs.writeFile);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Parse the body data
        const { file, filename, comment } = req.body;
        if (!file || !filename) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Remove data URI scheme if present and extract base64 data
        const base64Data = file.split(';base64,').pop();

        // Define the uploads directory path
        const uploadsDir = path.resolve('./public/uploads');
        const filePath = path.join(uploadsDir, filename);

        try {
            // Check if the uploads directory exists, if not, create it
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Save the file
            await writeFile(filePath, base64Data, 'base64');

            // Log file path, filename, and comment in MySQL
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'fileuploader'
            });

            // The SQL statement includes a placeholder for the comment
            await connection.execute(
                'INSERT INTO uploads (filename, filepath, comment) VALUES (?, ?, ?)',
                [filename, filePath, comment || ''] // Use an empty string if comment is not provided
            );

            // Close the database connection
            await connection.end();

            return res.status(200).json({ message: 'File uploaded successfully' });
        } catch (error) {
            console.error('Error uploading the file:', error);
            return res.status(500).json({ message: 'Server error uploading the file' });
        }
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
