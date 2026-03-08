from flask import request, jsonify
from app.model.encoder.budget_entries_db import (
    insert_budget_entries_db,
    get_budget_entries_db,
    put_budget_entries_db,
    delete_budget_entries_db,
)
from app.model.encoder.collections_db import (
    insert_collection_db,
    get_collection_db,
    put_collection_db,
    delete_collection_db,
    get_data_base_date_collection_db
)
from app.model.encoder.disbursements_db import (
    insert_disbursement_db,
    get_disbursement_db,
    put_disbursement_db,
    delete_disbursement_db,
    get_data_base_date_disbursement_db
)
from app.model.encoder.dfur_db import(
    insert_dfur_db,
    get_all_dfur_db,
    put_dfur_db,
    delete_dfur_db
) 
from app.model.general.activity_logs import insert_activity_logs_db
from datetime import datetime
import random
from flask import request

# Reserved/non-actual usernames that should fall back to default
SYSTEM_USERNAMES = {"system", "System", "SYSTEM", None, ""}

# inserting activity logs helper
def log_activity(user_id, username, action, module, description):
    resolved_user_id = user_id if user_id is not None else 4
    resolved_username = username if username not in SYSTEM_USERNAMES else "treasurer"
    insert_activity_logs_db(
        resolved_user_id,
        {
            "username": resolved_username,
            "action": action,
            "module": module,
            "description": description,
            "ip_address": request.remote_addr,
            "user_agent": request.headers.get("User-Agent")
        }
    )

# CRUD ==================================================
# BUDGET ENTRIES
def insert_budget_entries_controller():
    try:
        entries = request.get_json()

        if not entries:
            return jsonify({"message": "No entries provided"}), 400

        created_by = entries["created_by"]

        success = insert_budget_entries_db(entries, created_by)

        if success:
            log_activity(entries.get("user_id"), entries.get("username"), "INSERT", "Budget Management", "A new budget entry has been successfully recorded in the system.")
            return jsonify({"message": "Budget entry inserted successfully"}), 200
        else:
            log_activity(entries.get("user_id"), entries.get("username"), "INSERT_FAILED", "Budget Management", "Budget entry creation failed. The operation could not be completed. Please try again or contact the system administrator.")
            return jsonify({"message": "Failed to insert budget entry"}), 500

    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_budget_entries_controller():
    ...
    try:
        data = request.get_json()
        year = data["year"]
        
        if not year:
            return jsonify({"message": "No year provided"}), 400

        entries = get_budget_entries_db(year)

        if entries:
            #log_activity(data.get("user_id"), data.get("username"), "GET", "Budget Management", f"Budget entries for fiscal year {year} have been successfully retrieved.")
            return jsonify(entries), 200
        else:
            #log_activity(data.get("user_id"), data.get("username"), "GET_FAILED", "Budget Management", f"No budget entries were found for fiscal year {year}. The records may not exist or have been removed.")
            return jsonify({"message": "No budget entries found for the given year"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def update_budget_entries_controller():
    ...
    try:
        ...
        entry = request.get_json()

        if not entry:
            return jsonify({"message": "No entries provided"}), 400

        success = put_budget_entries_db(entry)

        if success:
            log_activity(entry.get("user_id"), entry.get("username"), "UPDATE", "Budget Management", f"Budget entry has been successfully updated.")
            return jsonify({"message": "Budget entry updated successfully"}), 200
        else:
            log_activity(entry.get("user_id"), entry.get("username"), "UPDATE_FAILED", "Budget Management", f"Budget entry update failed. Please verify the entry ID and try again.")
            return jsonify({"message": "There is no budget entry try to check the id"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
def delete_budget_entries_controller():
    ...
    try:
        ...
        data = request.get_json()
        entry_id = data["id"]

        if not entry_id:
            return jsonify({"message": "No entry ID provided"}), 400

        success = delete_budget_entries_db(entry_id)

        if success:
            log_activity(data.get("user_id"), data.get("username"), "DELETE", "Budget Management", f"Budget entry has been successfully deleted from the system.")
            return jsonify({"message": "Budget entry deleted successfully"}), 200
        else:
            log_activity(data.get("user_id"), data.get("username"), "DELETE_FAILED", "Budget Management", f"Budget entry deletion failed. Please verify the entry ID and try again.")
            return jsonify({"message": "Failed to delete budget entry"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
 
# COLLECTION 
def insert_disbursement_controller():
    ...
    try:
        ...
        entry = request.get_json()
        if not entry:
            return jsonify({"message": "No entries provided"}), 400
        
        success = insert_disbursement_db(entry)

        if success:
            log_activity(entry.get("user_id"), entry.get("username"), "INSERT", "Disbursement Management", "A new disbursement record has been successfully recorded in the system.")
            return jsonify({"message": "disbursement entries inserted successfully"}), 200
        else:
            log_activity(entry.get("user_id"), entry.get("username"), "INSERT_FAILED", "Disbursement Management", "Disbursement record creation failed. The operation could not be completed. Please try again or contact the system administrator.")
            return jsonify({"message": "Failed to insert disbursement entries"}), 500  
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_disbursement_controller():
    ...
    try:
        ...
        disbursement = get_disbursement_db()
        if disbursement:
            #log_activity(None, None, "GET", "Disbursement Management", "All disbursement records were successfully retrieved.")
            return jsonify(disbursement), 200
        else:
            #log_activity(None, None, "GET_FAILED", "Disbursement Management", "Disbursement record retrieval failed. No records were found in the database.")
            return jsonify({"message": "Failed to get disbursement"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def put_disbursement_controller():
    ...
    try:
        ...
        entry = request.get_json()
        if not entry:
            return jsonify({"message": "No entries provided"}), 400

        success = put_disbursement_db(entry)

        if success:
            log_activity(entry.get("user_id"), entry.get("username"), "UPDATE", "Disbursement Management", f"Disbursement record has been successfully updated.")
            return jsonify({"message": "disbursement entries updated successfully"}), 200
        else:
            log_activity(entry.get("user_id"), entry.get("username"), "UPDATE_FAILED", "Disbursement Management", f"Disbursement record update failed. Please verify the record ID and try again.")
            return jsonify({"message": "There is no disbursement to update"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def delete_disbursement_controller():
    ...
    try:
        ...
        data = request.get_json()
        disbursement_id = data["disbursement_id"]
        success = delete_disbursement_db(disbursement_id)

        if success:
            log_activity(data.get("user_id"), data.get("username"), "DELETE", "Disbursement Management", f"Disbursement record has been successfully deleted from the system.")
            return jsonify({"message": "disbursement entries deleted successfully"}), 200
        else:
            log_activity(data.get("user_id"), data.get("username"), "DELETE_FAILED", "Disbursement Management", f"Disbursement record deletion failed. Please verify the record ID and try again.")
            return jsonify({"message": "Failed to delete disbursement entries"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
    
# DISBURSEMENT
def insert_collection_controller():
    ...
    try:
        ...
        entry = request.get_json()
        if not entry:
            return jsonify({"message": "No entries provided"}), 400
        
        success = insert_collection_db(entry)

        if success:
            log_activity(entry.get("user_id"), entry.get("username"), "INSERT", "Collection Management", "A new collection record has been successfully recorded in the system.")
            return jsonify({"message": "Collection entries inserted successfully"}), 200
        else:
            log_activity(entry.get("user_id"), entry.get("username"), "INSERT_FAILED", "Collection Management", "Collection record creation failed. The operation could not be completed. Please try again or contact the system administrator.")
            return jsonify({"message": "Failed to insert collection entries"}), 500  
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_collection_controller():
    ...
    try:
        ...
        collection = get_collection_db()
        if collection:
            #log_activity(None, None, "GET", "Collection Management", "All collection records were successfully retrieved.")
            return jsonify(collection), 200
        else:
            #log_activity(None, None, "GET_FAILED", "Collection Management", "Collection record retrieval failed. No records were found in the database.")
            return jsonify({"message": "Failed to get collection"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def put_collection_controller():
    ...
    try:
        ...
        entry = request.get_json()
        if not entry:
            return jsonify({"message": "No entries provided"}), 400

        success = put_collection_db(entry)

        if success:
            log_activity(entry.get("user_id"), entry.get("username"), "UPDATE", "Collection Management", f"Collection record has been successfully updated.")
            return jsonify({"message": "Collection entries updated successfully"}), 200
        else:
            log_activity(entry.get("user_id"), entry.get("username"), "UPDATE_FAILED", "Collection Management", f"Collection record update failed. Please verify the record ID and try again.")
            return jsonify({"message": "There is no collection to update"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def delete_collection_controller():
    ...
    try:
        ...
        data = request.get_json()
        collection_id = data["collection_id"]
        success = delete_collection_db(collection_id)

        if success:
            log_activity(data.get("user_id"), data.get("username"), "DELETE", "Collection Management", f"Collection record has been successfully deleted from the system.")
            return jsonify({"message": "Collection entries deleted successfully"}), 200
        else:
            log_activity(data.get("user_id"), data.get("username"), "DELETE_FAILED", "Collection Management", f"Collection record deletion failed. Please verify the record ID and try again.")
            return jsonify({"message": "Failed to delete collection entries"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_data_base_range_date_controller():
    try:
        ...
        data = request.get_json()
        start_date = data["start_date"]
        end_date = data["end_date"]
        data_name = data["data_name"]
        print(data)
        if data_name == "collection":
            result = get_data_base_date_collection_db(start_date, end_date)
            #log_activity(data.get("user_id"), data.get("username"), "GET", "Collection Management", f"Collection records for the period {start_date} to {end_date} have been successfully retrieved.")
            return jsonify({"message": "Successfully retrieved data", "data": result}), 200
        elif data_name == "disbursement":
            result = get_data_base_date_disbursement_db(start_date, end_date)
            #log_activity(data.get("user_id"), data.get("username"), "GET", "Disbursement Management", f"Disbursement records for the period {start_date} to {end_date} have been successfully retrieved.")
            return jsonify({"message": "Successfully retrieved data", "data": result}), 200
        else:
            #log_activity(data.get("user_id"), data.get("username"), "GET_FAILED", "Data Range Query", f"Date-range query failed. The specified data type '{data_name}' is not recognized. Please provide a valid data type and try again.")
            return jsonify({"message": "Invalid data name"}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    

# DFUR PROJECT  
def insert_dfur_controller():
    try:
        data = request.get_json();
        if data['status'] == 'Planned':
            data['status'] = 'planned'
        elif data['status'] == 'Completed':
            data['status'] = 'completed'
        elif data['status'] == 'On Hold':
            data['status'] = 'on_hold'
        elif data['status'] == 'Cancelled':
            data['status'] = 'cancelled'
        elif data['status'] == 'In Progress':
            data['status'] = 'in_progress'
        
        result = insert_dfur_db(data)
        if result:
            log_activity(data.get("user_id"), data.get("username"), "INSERT", "DFUR Project Management", "A new DFUR project record has been successfully recorded in the system.")
            return jsonify({"message": "Successfully inserted data"}), 200
        else:
            log_activity(data.get("user_id"), data.get("username"), "INSERT_FAILED", "DFUR Project Management", "DFUR project record creation failed. The operation could not be completed. Please try again or contact the system administrator.")
            return jsonify({"message": "Failed to insert data"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
def put_dfur_controller():
    try:
        data = request.get_json()
       
        if data['status'] == 'Planned':
            data['status'] = 'planned'
        elif data['status'] == 'Completed':
            data['status'] = 'completed'
        elif data['status'] == 'On Hold':
            data['status'] = 'on_hold'
        elif data['status'] == 'Cancelled':
            data['status'] = 'cancelled'
        elif data['status'] == 'In Progress':
            data['status'] = 'in_progress'
            
        result = put_dfur_db(data)
        
        if result:
            log_activity(data.get("user_id"), data.get("username"), "UPDATE", "DFUR Project Management", f"DFUR project record has been successfully updated.")
            return jsonify({"message": "Successfully updated data"}), 200
        else:
            log_activity(data.get("user_id"), data.get("username"), "UPDATE_FAILED", "DFUR Project Management", f"DFUR project record update failed. No matching record was found for ID: {data.get('id')}. Please verify the record ID and try again.")
            return jsonify({"message": "Failed to update data"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_dfur_controller():
    try:
        result = get_all_dfur_db()
        if result:
            #log_activity(None, None, "GET", "DFUR Project Management", "All DFUR project records were successfully retrieved.")
            return jsonify({"message": "Successfully retrieved data", "data": result}), 200
        else:
            #log_activity(None, None, "GET_FAILED", "DFUR Project Management", "DFUR project record retrieval failed. No records were found in the database.")
            return jsonify({"message": "Invalid data name"}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
def delete_dfur_controller():
    try:
        data = request.get_json()
        id = data['id']
        result = delete_dfur_db(id)
        if result:
            log_activity(data.get("user_id"), data.get("username"), "DELETE", "DFUR Project Management", f"DFUR project record has been successfully deleted from the system.")
            return jsonify({"message": "Successfully deleted data"}), 200
        else:
            log_activity(data.get("user_id"), data.get("username"), "DELETE_FAILED", "DFUR Project Management", f"DFUR project record deletion failed. Please verify the record ID and try again.")
            return jsonify({"message": "Failed to delete data"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    

def generate_transaction_id_controller(prefix, data_type):
    counter = 1
    if data_type == 'collection':
        counter = len(get_collection_db())
    elif data_type == 'budget_entries':
        counter = len(get_budget_entries_db(datetime.now().year))
    elif data_type == 'disbursement':
        counter = len(get_disbursement_db())
    elif data_type == 'dfur':
        counter = len(get_all_dfur_db())
    counter += 1
    
    year = datetime.now().year
    return f"{prefix}-{year}-{counter:03d}"

def generate_11_digit_number_controller():
    return random.randint(10_000_000_000, 99_999_999_999)