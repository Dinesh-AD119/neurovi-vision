from fastapi import APIRouter, Response, status
from backend.services.record_service import RecordService
from backend.core.exceptions import AnalysisNotFoundException
from backend.schemas.records import RecordItem, RecordDetailResponse
from typing import List

router = APIRouter()

@router.get("/records", response_model=List[RecordItem])
def get_all_records():
    return RecordService.get_all_records()

@router.get("/records/{analysis_id}", response_model=RecordDetailResponse)
def get_record(analysis_id: str):
    record = RecordService.get_record(analysis_id)
    if not record:
        raise AnalysisNotFoundException()
    return record

@router.delete("/records/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(analysis_id: str):
    success = RecordService.delete_record(analysis_id)
    if not success:
        raise AnalysisNotFoundException()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete("/records", status_code=status.HTTP_204_NO_CONTENT)
def clear_records():
    RecordService.clear_all()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
