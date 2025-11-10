from flask import Flask, request, jsonify
import spacy
import PyPDF2
from flask_cors import CORS  # ✅ Allow cross-origin requests

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# Load SpaCy model
nlp = spacy.load("en_core_web_sm")

# Example skills and matching careers
career_skills = {
    "Data Scientist": ["python", "machine learning", "statistics", "data analysis", "pandas", "numpy"],
    "Web Developer": ["html", "css", "javascript", "react", "node", "frontend", "backend"],
    "AI Engineer": ["python", "tensorflow", "keras", "deep learning", "nlp", "pytorch"],
    "Cloud Engineer": ["aws", "azure", "gcp", "docker", "kubernetes", "devops"],
    "Cybersecurity Analyst": ["network", "security", "firewall", "encryption", "ethical hacking", "malware"]
}

# Function to extract text from PDF
def extract_text_from_pdf(file):
    text = ""
    pdf_reader = PyPDF2.PdfReader(file)
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text.lower()

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AI Career Recommendation API is running 🚀"})

@app.route("/upload", methods=["POST"])
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Extract text from PDF
    text = extract_text_from_pdf(file)

    # NLP processing
    doc = nlp(text)

    # Find skills present in the resume
    found_skills = set()
    for token in doc:
        for career, skills in career_skills.items():
            if token.text.lower() in skills:
                found_skills.add(token.text.lower())

    # Calculate matching scores for all careers
    scores = []
    for career, skills in career_skills.items():
        match_score = len(set(skills) & found_skills)
        if match_score > 0:
            scores.append((career, match_score))

    # Sort and find top 3 careers
    scores.sort(key=lambda x: x[1], reverse=True)
    top_3 = scores[:3]

    # ✅ Select top recommended career
    top_career = top_3[0][0] if top_3 else "N/A"

    # ✅ Return the same JSON format your frontend expects
    return jsonify({
        "recommended_career": top_career,
        "skills_found": list(found_skills)
    })

if __name__ == "__main__":
    app.run(debug=True)
