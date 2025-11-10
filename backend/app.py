from flask import Flask, request, jsonify
import spacy
import PyPDF2
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app
from datetime import datetime

# ===================================
# 🔥 Flask + Firebase Initialization
# ===================================
app = Flask(__name__)
CORS(app)

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")  # Make sure this file is in backend folder
initialize_app(cred)
db = firestore.client()

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

# =================================================
# 🧩 Helper: Extract text from uploaded PDF
# =================================================
def extract_text_from_pdf(file):
    text = ""
    pdf_reader = PyPDF2.PdfReader(file)
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text.lower()

# =================================================
# 🧠 Helper: Calculate XP dynamically
# =================================================
def calculate_xp(previous_history, new_skills, new_career):
    base_xp = 50  # Each upload gives base XP
    bonus = 0

    if previous_history:
        # Unique new skills
        all_prev_skills = {skill for h in previous_history for skill in h.get("skills", [])}
        new_unique = len(set(new_skills) - all_prev_skills)
        bonus += new_unique * 5

        # Different career bonus
        last_career = previous_history[-1].get("recommendedCareer", "")
        if new_career != last_career:
            bonus += 40

        # Streak bonus
        last_timestamp = previous_history[-1].get("timestamp")
        if last_timestamp:
            try:
                if hasattr(last_timestamp, "timestamp"):
                    last_date = last_timestamp
                else:
                    last_date = datetime.fromtimestamp(last_timestamp["seconds"])
                diff_days = (datetime.now() - last_date).days
                if diff_days >= 1:
                    bonus += 10
            except Exception as e:
                print("⚠️ Timestamp parse error:", e)

    return base_xp + bonus

# =================================================
# 🎯 Helper: Calculate level from total XP
# =================================================
def calculate_level(total_xp):
    return (total_xp // 100) + 1

# =================================================
# 🏠 Home route
# =================================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AI Career Recommendation API with Gamification 🚀"})

# =================================================
# 📄 Resume upload route
# =================================================
@app.route("/upload", methods=["POST"])
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    user_id = request.form.get("user_id")

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400

    # Extract text
    text = extract_text_from_pdf(file)
    doc = nlp(text)

    # Find skills
    found_skills = set()
    for token in doc:
        for career, skills in career_skills.items():
            if token.text.lower() in skills:
                found_skills.add(token.text.lower())

    # Match scoring
    scores = []
    for career, skills in career_skills.items():
        match_score = len(set(skills) & found_skills)
        if match_score > 0:
            scores.append((career, match_score))

    scores.sort(key=lambda x: x[1], reverse=True)
    top_career = scores[0][0] if scores else "N/A"

    # 🔥 Firestore Integration
    user_ref = db.collection("users").document(user_id)
    history_ref = user_ref.collection("history")

    # Fetch previous uploads
    existing_history = [doc.to_dict() for doc in history_ref.stream()]

    # Calculate XP, Level
    xp_earned = calculate_xp(existing_history, list(found_skills), top_career)
    total_xp = sum(h.get("xp", 0) for h in existing_history) + xp_earned
    level = calculate_level(total_xp)

    # Save this record
    history_ref.add({
        "recommendedCareer": top_career,
        "skills": list(found_skills),
        "xp": xp_earned,
        "timestamp": firestore.SERVER_TIMESTAMP
    })

    # ✅ Return structured response
    return jsonify({
        "recommended_career": top_career,
        "skills_found": list(found_skills),
        "xp_earned": xp_earned,
        "total_xp": total_xp,
        "level": level
    })

# =================================================
# 🚀 Run Flask app
# =================================================
if __name__ == "__main__":
    app.run(debug=True)
