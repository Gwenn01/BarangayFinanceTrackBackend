import bcrypt
from app.database.connection import get_db_connection

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


users = [
("superadmin","admin123","superadmin","System Administrator","Super Admin",1),
("kapitan","kapitan123","admin","Barangay Captain","Kapitan",1),
("secretary","secretary123","admin","Barangay Secretary","Secretary",1),
("treasurer","treasurer123","encoder","Barangay Treasurer","Treasurer",1),
("bookkeeper","bookkeeper123","checker","Barangay Bookkeeper","Bookkeeper",1),
("council1","council123","reviewer","Barangay Councilor 1","Barangay Council",1),
("approver","approver123","approver","Budget Approver","Kapitan",1)
]

conn = get_db_connection()
cursor = conn.cursor()

for u in users:
    cursor.execute("""
        INSERT INTO users (username,password,role,full_name,position,is_active)
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (u[0], hash_password(u[1]), *u[2:]))

conn.commit()
cursor.close()
conn.close()

print("Users seeded successfully")