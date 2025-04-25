⚡ Serverless Cloud Dictionary
A sleek, full-stack serverless app to search, explore, and generate AI-powered explanations for cloud computing terms.
🌟 Features
🔍 Smart Search – Autocomplete suggestions as you type

📚 Curated Definitions – Clear explanations with real-world examples

🤖 AI Magic – Claude 3 (via Amazon Bedrock) generates human-like explanations

💾 Fully Serverless – DynamoDB powers backend storage

🛠️ Architecture Overview
Built entirely with AWS-native technologies:

Frontend – React, deployed via AWS Amplify

API Layer – REST endpoints using API Gateway + Lambda

AI Integration – Claude 3 Sonnet through Amazon Bedrock

Data Storage – DynamoDB, with optional writes for AI-generated content

🖼️ Architecture Diagram

![Blank diagram](https://github.com/user-attachments/assets/731f909c-ea8d-4762-976e-e915d7285862)

🚫 Why There's No Live Demo
This app uses Claude 3 for AI generation, which incurs costs per use. To keep things lean:

🎥 Watch the walkthrough video → https://tinyurl.com/233jyoyc

🧪 Run It Locally
Clone the repo and get started in seconds:
git clone https://github.com/priyankas247/serverless-cloud-dictionary
cd serverless-cloud-dictionary
npm install
npm start

