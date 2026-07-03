from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv
import os
import sqlite3


load_dotenv()
with open("company_context.txt", "r", encoding="utf-8") as file:
    COMPANY_CONTEXT = file.read()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)
def get_employee(employee_id):
    conn = sqlite3.connect("employees.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM employees WHERE employee_id=?",
        (employee_id,)
    )

    employee = cursor.fetchone()

    conn.close()

    return employee

@app.get("/")
def home():
    return {"message": "HR AI Backend is running!"}

@app.post("/chat")
async def chat(data: dict):

    user_message = data.get("message", "")

    # Check if the user entered an Employee ID
    employee = get_employee(user_message.strip().upper())

    if employee:
        return {
    "reply":
        "✅ Employee Details\n\n"
        f"Employee ID: {employee[0]}\n"
        f"Name: {employee[1]}\n"
        f"Department: {employee[2]}\n"
        f"Email: {employee[3]}\n"
        f"Reporting Manager: {employee[4]}\n"
        f"Leave Balance: {employee[5]} days\n"
        f"Location: {employee[6]}"
}

    prompt = f"""
You are Pi Systems' official AI HR Assistant.

Use the following company information to answer questions.

Company Information:
{COMPANY_CONTEXT}

Rules:
- Answer ONLY questions related to Pi Systems, HR, onboarding, careers, internships, company services, company culture, interview process, and employee support.
- If the answer exists in the company information above, use it.
- If the user asks something unrelated (sports, politics, movies, etc.), politely reply:
  "Sorry, I can only answer questions related to Pi Systems and HR."

User Question:
{user_message}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return {
        "reply": response.text
    }