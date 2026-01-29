from app.database.connection import get_db_connection

def insert_budget_entries_db(entries, created_by):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO budget_entries (
                transaction_id,
                transaction_date,
                category,
                subcategory,
                amount,
                fund_source,
                payee,
                dv_number,
                expenditure_program,
                program_description,
                remarks,
                allocation_id,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        for entry in entries:
            cursor.execute(query, (
                entry["transaction_id"],
                entry["transaction_date"],
                entry["category"],
                entry.get("subcategory"),
                entry["amount"],
                entry.get("fund_source"),
                entry.get("payee"),
                entry.get("dv_number"),
                entry.get("expenditure_program"),
                entry.get("program_description"),
                entry.get("remarks"),
                entry.get("allocation_id"),
                created_by
            ))

        conn.commit()
        conn.close()
        return True

    except Exception as e:
        print(f"Error inserting budget entries: {e}")
        return False
