import requests

# URL of your running Flask backend
url = "http://127.0.0.1:5000/upload"

# Open your PDF file
files = {"file": open("test_resume.pdf", "rb")}

# Send POST request
response = requests.post(url, files=files)

# Print JSON response
print(response.json())
