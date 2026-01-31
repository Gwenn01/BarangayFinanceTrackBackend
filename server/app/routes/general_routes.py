from flask import Blueprint
from app.controllers.general_controller import (
    get_total_data_budget_allocation_controller,
    get_total_data_collection_controller,
    get_total_data_disbursement_controller,
    get_total_data_dfur_controller
)

general_bp = Blueprint("general_bp", __name__)

# CALCULATION =============================================
@general_bp.route('/get-total-data-budget-allocation', methods=['GET'])
def get_total_data_budget_allocation():
    return get_total_data_budget_allocation_controller()


@general_bp.route('/get-total-data-collection', methods=['GET'])
def get_total_data_collection():
    return get_total_data_collection_controller()


@general_bp.route('/get-total-data-disbursement', methods=['GET'])
def get_total_data_disbursement():
    return get_total_data_disbursement_controller()

@general_bp.route('/get-total-data-dfur-project', methods=['GET'])
def total_data_dfur_project():
    return get_total_data_dfur_controller()
