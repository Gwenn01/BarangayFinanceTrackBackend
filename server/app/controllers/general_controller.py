from flask import request, jsonify
from app.services.total_calculation import result_total_data

#CALCULATIONS===========================================+
def get_total_data_budget_allocation_controller():
    try:
        ...
        data = {}
        year = 2026
        total_data = result_total_data("budget_entries", year)
        # return only the data needed
        data['total_data'] = total_data["total_data"]
        data['total_amount'] = total_data["total_amount"]
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_total_data_collection_controller():
    try:
        ...
        total_data = result_total_data("collections")
        return jsonify(total_data), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
def get_total_data_disbursement_controller():
    ...
    try:
        total_data = result_total_data("disbursements")
        return jsonify(total_data), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
  
def get_total_data_dfur_controller():
    try:
        ...
        total_data = result_total_data("dfur_projects")
        return jsonify(total_data), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500