from fpdf import FPDF

# Create a PDF
pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)

# Sample resume text
text = """John Doe
Skills: Python, Machine Learning, Data Analysis, Statistics
Education: B.Sc in Computer Science
Experience: Internship at XYZ Company
"""

pdf.multi_cell(0, 10, text)
pdf.output("test_resume.pdf")

print("PDF created successfully!")
