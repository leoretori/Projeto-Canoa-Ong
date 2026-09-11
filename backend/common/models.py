"""
Modelos Pydantic v2 do Va'aFlow.
Gerenciado pelo Subagent 3 (Back-End/API).
Todos os payloads JSON devem ser estritamente validados contra estes schemas.
"""

from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


class AccessibilityType(str, Enum):
    NONE = "NONE"
    WHEELCHAIR = "WHEELCHAIR"              # Cadeirante (exige assento adaptado)
    REDUCED_MOBILITY = "REDUCED_MOBILITY"  # Mobilidade reduzida
    VISUAL_IMPAIRMENT = "VISUAL_IMPAIRMENT"
    OTHER = "OTHER"


class UserRole(str, Enum):
    ATHLETE = "ATHLETE"
    INSTRUCTOR = "INSTRUCTOR"
    ADMIN = "ADMIN"


class SessionStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    OPEN = "OPEN"
    FULL = "FULL"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


# ============================================================================
# Schemas de Usuários (Perfil e Acessibilidade)
# ============================================================================

class UserProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Nome completo")
    phone: Optional[str] = Field(None, max_length=20, description="Telefone de contato")
    has_accessibility_needs: bool = Field(default=False, description="Indica necessidade de apoio de acessibilidade")
    accessibility_type: AccessibilityType = Field(default=AccessibilityType.NONE, description="Tipo de necessidade")
    notes: Optional[str] = Field(None, max_length=500, description="Observações para a equipe de apoio/embarque")


class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    name: str
    phone: Optional[str] = None
    has_accessibility_needs: bool = False
    accessibility_type: AccessibilityType = AccessibilityType.NONE
    role: UserRole = UserRole.ATHLETE
    notes: Optional[str] = None
    created_at: str


# ============================================================================
# Schemas de Sessões / Remadas
# ============================================================================

class SessionCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    date: str = Field(..., description="Data da remada no formato YYYY-MM-DD")
    time: str = Field(..., description="Horário de saída no formato HH:MM")
    location: str = Field("Praia Grande - São Sebastião", min_length=3, max_length=150)
    canoe_type: str = Field("OC6", min_length=2, max_length=20, description="Modelo da canoa Va'a")
    total_capacity: int = Field(6, ge=1, le=12, description="Capacidade máxima de remadores na canoa")
    max_adapted_seats: int = Field(2, ge=0, le=4, description="Limite de assentos adaptados disponíveis")
    instructor_name: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Formato de data inválido. Utilize YYYY-MM-DD.")
        return v

    @field_validator("time")
    @classmethod
    def validate_time_format(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%H:%M")
        except ValueError:
            raise ValueError("Formato de hora inválido. Utilize HH:MM.")
        return v


class SessionStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: SessionStatus


class SessionResponse(BaseModel):
    session_id: str
    date: str
    time: str
    location: str
    canoe_type: str
    total_capacity: int
    booked_seats: int = 0
    max_adapted_seats: int
    booked_adapted_seats: int = 0
    status: SessionStatus = SessionStatus.OPEN
    instructor_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: str

    @property
    def available_seats(self) -> int:
        return max(0, self.total_capacity - self.booked_seats)

    @property
    def available_adapted_seats(self) -> int:
        return max(0, self.max_adapted_seats - self.booked_adapted_seats)


# ============================================================================
# Schemas de Reservas (Vagas Convencionais e Adaptadas)
# ============================================================================

class ReservationCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    requires_adapted_seat: bool = Field(
        default=False, 
        description="Solicita uso prioritário de assento adaptado para cadeirante/mobilidade reduzida"
    )
    notes: Optional[str] = Field(None, max_length=300, description="Necessidades especiais de embarque")


class ReservationResponse(BaseModel):
    reservation_id: str
    session_id: str
    user_id: str
    user_name: str
    user_email: str
    requires_adapted_seat: bool
    status: str = "CONFIRMED"
    notes: Optional[str] = None
    created_at: str

