-- ============================================================
-- MIGRATION 001 - Schema inicial do ClinicaSaaS
-- MySQL 8.4+  |  charset: utf8mb4
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '-03:00';

-- ============================================================
-- TABELA: clinics (tenants)
-- ============================================================
CREATE TABLE clinics (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  name            VARCHAR(150) NOT NULL,
  slug            VARCHAR(100) NOT NULL,
  cnpj            VARCHAR(18)  DEFAULT NULL,
  owner_name      VARCHAR(150) NOT NULL,
  owner_email     VARCHAR(200) NOT NULL,
  owner_phone     VARCHAR(20)  NOT NULL,
  address         VARCHAR(200) DEFAULT NULL,
  city            VARCHAR(100) DEFAULT NULL,
  state           CHAR(2)      DEFAULT NULL,
  zip_code        VARCHAR(9)   DEFAULT NULL,
  logo_url        TEXT         DEFAULT NULL,
  primary_color   VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  plan            ENUM('starter','professional','business','enterprise') NOT NULL DEFAULT 'starter',
  status          ENUM('trial','active','suspended','cancelled')         NOT NULL DEFAULT 'trial',
  trial_ends_at   TIMESTAMP    DEFAULT NULL,
  subscription_id VARCHAR(200) DEFAULT NULL,
  max_professionals INT        NOT NULL DEFAULT 1,
  timezone        VARCHAR(60)  NOT NULL DEFAULT 'America/Sao_Paulo',
  settings        JSON         DEFAULT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clinics_slug (slug),
  KEY idx_clinics_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: users
-- ============================================================
CREATE TABLE users (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id         CHAR(36)     DEFAULT NULL,
  name              VARCHAR(150) NOT NULL,
  email             VARCHAR(200) NOT NULL,
  password          VARCHAR(255) NOT NULL,
  phone             VARCHAR(20)  DEFAULT NULL,
  avatar_url        TEXT         DEFAULT NULL,
  role              ENUM('super_admin','clinic_owner','manager','receptionist','professional','financial') NOT NULL DEFAULT 'receptionist',
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at     TIMESTAMP    DEFAULT NULL,
  refresh_token     TEXT         DEFAULT NULL,
  email_verified_at TIMESTAMP    DEFAULT NULL,
  preferences       JSON         DEFAULT NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email_clinic (email, clinic_id),
  KEY idx_users_clinic (clinic_id),
  KEY idx_users_email (email),
  CONSTRAINT fk_users_clinic FOREIGN KEY (clinic_id) REFERENCES clinics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: clients
-- ============================================================
CREATE TABLE clients (
  id             CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id      CHAR(36)     NOT NULL,
  name           VARCHAR(150) NOT NULL,
  cpf            VARCHAR(14)  DEFAULT NULL,
  birth_date     DATE         DEFAULT NULL,
  gender         ENUM('female','male','other','not_informed') NOT NULL DEFAULT 'not_informed',
  phone          VARCHAR(20)  NOT NULL,
  whatsapp       VARCHAR(20)  DEFAULT NULL,
  email          VARCHAR(200) DEFAULT NULL,
  address        TEXT         DEFAULT NULL,
  city           VARCHAR(100) DEFAULT NULL,
  state          CHAR(2)      DEFAULT NULL,
  zip_code       VARCHAR(9)   DEFAULT NULL,
  notes          TEXT         DEFAULT NULL,
  how_found_us   VARCHAR(100) DEFAULT NULL,
  referred_by_id CHAR(36)     DEFAULT NULL,
  status         ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  first_visit_at DATE         DEFAULT NULL,
  last_visit_at  DATE         DEFAULT NULL,
  total_spent    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_visits   INT          NOT NULL DEFAULT 0,
  anamnesis      JSON         DEFAULT NULL,
  photo_urls     JSON         DEFAULT NULL,
  loyalty_points INT          NOT NULL DEFAULT 0,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_clients_clinic (clinic_id),
  KEY idx_clients_status (clinic_id, status),
  KEY idx_clients_cpf (clinic_id, cpf),
  -- Busca textual eficiente no MySQL
  FULLTEXT KEY ft_clients_name (name),
  CONSTRAINT fk_clients_clinic FOREIGN KEY (clinic_id) REFERENCES clinics (id) ON DELETE CASCADE,
  CONSTRAINT fk_clients_referred FOREIGN KEY (referred_by_id) REFERENCES clients (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: services (procedimentos)
-- ============================================================
CREATE TABLE services (
  id                     CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id              CHAR(36)     NOT NULL,
  name                   VARCHAR(150) NOT NULL,
  description            TEXT         DEFAULT NULL,
  category               ENUM('facial','corporal','laser','massagem','estetica_avancada','depilacao','unha','maquiagem','outros') NOT NULL DEFAULT 'outros',
  duration_minutes       INT          NOT NULL DEFAULT 60,
  price                  DECIMAL(10,2) NOT NULL,
  cost                   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  commission_percentage  DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  is_active              TINYINT(1)   NOT NULL DEFAULT 1,
  requires_equipment     JSON         DEFAULT NULL,
  color                  VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  image_url              TEXT         DEFAULT NULL,
  max_sessions_package   INT          DEFAULT NULL,
  post_care_instructions TEXT         DEFAULT NULL,
  sort_order             INT          NOT NULL DEFAULT 0,
  created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at             TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_services_clinic (clinic_id),
  CONSTRAINT fk_services_clinic FOREIGN KEY (clinic_id) REFERENCES clinics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: professionals
-- ============================================================
CREATE TABLE professionals (
  id                    CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id             CHAR(36)     NOT NULL,
  user_id               CHAR(36)     DEFAULT NULL,
  name                  VARCHAR(150) NOT NULL,
  specialty             VARCHAR(100) DEFAULT NULL,
  phone                 VARCHAR(20)  DEFAULT NULL,
  email                 VARCHAR(200) DEFAULT NULL,
  avatar_url            TEXT         DEFAULT NULL,
  color                 VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  is_active             TINYINT(1)   NOT NULL DEFAULT 1,
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  working_hours         JSON         DEFAULT NULL,
  service_ids           JSON         DEFAULT NULL,
  bio                   TEXT         DEFAULT NULL,
  total_appointments    INT          NOT NULL DEFAULT 0,
  rating                DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_professionals_clinic (clinic_id),
  CONSTRAINT fk_professionals_clinic FOREIGN KEY (clinic_id) REFERENCES clinics (id) ON DELETE CASCADE,
  CONSTRAINT fk_professionals_user  FOREIGN KEY (user_id)   REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: appointments (agendamentos)
-- ============================================================
CREATE TABLE appointments (
  id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id           CHAR(36)     NOT NULL,
  client_id           CHAR(36)     NOT NULL,
  service_id          CHAR(36)     NOT NULL,
  professional_id     CHAR(36)     NOT NULL,
  package_session_id  CHAR(36)     DEFAULT NULL,
  start_at            TIMESTAMP    NOT NULL,
  end_at              TIMESTAMP    NOT NULL,
  duration_minutes    INT          NOT NULL,
  status              ENUM('scheduled','confirmed','in_progress','completed','cancelled','no_show','rescheduled') NOT NULL DEFAULT 'scheduled',
  origin              ENUM('manual','online','whatsapp','instagram','phone') NOT NULL DEFAULT 'manual',
  room                VARCHAR(50)  DEFAULT NULL,
  price               DECIMAL(10,2) NOT NULL,
  discount            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  final_price         DECIMAL(10,2) NOT NULL,
  notes               TEXT         DEFAULT NULL,
  client_notes        TEXT         DEFAULT NULL,
  confirmed_at        TIMESTAMP    DEFAULT NULL,
  cancelled_at        TIMESTAMP    DEFAULT NULL,
  cancellation_reason TEXT         DEFAULT NULL,
  reminder_sent       TINYINT(1)   NOT NULL DEFAULT 0,
  rating              TINYINT      DEFAULT NULL,
  commission_value    DECIMAL(10,2) DEFAULT NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_appointments_clinic_date    (clinic_id, start_at),
  KEY idx_appointments_professional   (clinic_id, professional_id, start_at),
  KEY idx_appointments_client         (clinic_id, client_id),
  KEY idx_appointments_status         (clinic_id, status),
  CONSTRAINT fk_appointments_clinic      FOREIGN KEY (clinic_id)       REFERENCES clinics       (id),
  CONSTRAINT fk_appointments_client      FOREIGN KEY (client_id)       REFERENCES clients       (id),
  CONSTRAINT fk_appointments_service     FOREIGN KEY (service_id)      REFERENCES services      (id),
  CONSTRAINT fk_appointments_professional FOREIGN KEY (professional_id) REFERENCES professionals (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: client_packages
-- ============================================================
CREATE TABLE client_packages (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id         CHAR(36)     NOT NULL,
  client_id         CHAR(36)     NOT NULL,
  service_id        CHAR(36)     NOT NULL,
  name              VARCHAR(150) NOT NULL,
  total_sessions    INT          NOT NULL,
  used_sessions     INT          NOT NULL DEFAULT 0,
  total_price       DECIMAL(10,2) NOT NULL,
  price_per_session DECIMAL(10,2) NOT NULL,
  status            ENUM('active','completed','expired','cancelled') NOT NULL DEFAULT 'active',
  purchased_at      DATE         NOT NULL DEFAULT (CURRENT_DATE),
  expires_at        DATE         DEFAULT NULL,
  notes             TEXT         DEFAULT NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_packages_clinic  (clinic_id),
  KEY idx_packages_client  (client_id),
  CONSTRAINT fk_packages_clinic  FOREIGN KEY (clinic_id)  REFERENCES clinics   (id) ON DELETE CASCADE,
  CONSTRAINT fk_packages_client  FOREIGN KEY (client_id)  REFERENCES clients   (id),
  CONSTRAINT fk_packages_service FOREIGN KEY (service_id) REFERENCES services  (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE package_sessions (
  id             CHAR(36)  NOT NULL DEFAULT (UUID()),
  package_id     CHAR(36)  NOT NULL,
  appointment_id CHAR(36)  DEFAULT NULL,
  session_number INT       NOT NULL,
  scheduled_at   TIMESTAMP DEFAULT NULL,
  completed_at   TIMESTAMP DEFAULT NULL,
  notes          TEXT      DEFAULT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pkg_sessions_package (package_id),
  CONSTRAINT fk_pkg_sessions_package FOREIGN KEY (package_id) REFERENCES client_packages (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: financial_transactions
-- ============================================================
CREATE TABLE financial_transactions (
  id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id           CHAR(36)     NOT NULL,
  client_id           CHAR(36)     DEFAULT NULL,
  appointment_id      CHAR(36)     DEFAULT NULL,
  package_id          CHAR(36)     DEFAULT NULL,
  professional_id     CHAR(36)     DEFAULT NULL,
  description         VARCHAR(200) NOT NULL,
  type                ENUM('income','expense') NOT NULL,
  category            VARCHAR(40)  NOT NULL,
  status              ENUM('pending','paid','overdue','cancelled','refunded') NOT NULL DEFAULT 'pending',
  amount              DECIMAL(10,2) NOT NULL,
  discount            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  final_amount        DECIMAL(10,2) NOT NULL,
  payment_method      ENUM('cash','credit_card','debit_card','pix','bank_transfer','boleto','package','courtesy') DEFAULT NULL,
  due_date            DATE         NOT NULL,
  paid_at             TIMESTAMP    DEFAULT NULL,
  installments        INT          NOT NULL DEFAULT 1,
  installment_number  INT          NOT NULL DEFAULT 1,
  pix_key             VARCHAR(150) DEFAULT NULL,
  receipt_url         TEXT         DEFAULT NULL,
  notes               TEXT         DEFAULT NULL,
  external_payment_id VARCHAR(200) DEFAULT NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_financial_clinic      (clinic_id),
  KEY idx_financial_date        (clinic_id, due_date),
  KEY idx_financial_type_status (clinic_id, type, status),
  CONSTRAINT fk_financial_clinic FOREIGN KEY (clinic_id) REFERENCES clinics (id) ON DELETE CASCADE,
  CONSTRAINT fk_financial_client FOREIGN KEY (client_id) REFERENCES clients (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: stock_products
-- ============================================================
CREATE TABLE stock_products (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id        CHAR(36)     NOT NULL,
  name             VARCHAR(150) NOT NULL,
  brand            VARCHAR(50)  DEFAULT NULL,
  sku              VARCHAR(50)  DEFAULT NULL,
  unit             VARCHAR(20)  DEFAULT NULL,
  current_quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  min_quantity     DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  unit_cost        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  unit_price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category         VARCHAR(80)  DEFAULT NULL,
  image_url        TEXT         DEFAULT NULL,
  is_active        TINYINT(1)   NOT NULL DEFAULT 1,
  location         VARCHAR(100) DEFAULT NULL,
  notes            TEXT         DEFAULT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at       TIMESTAMP    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_stock_clinic (clinic_id),
  CONSTRAINT fk_stock_clinic FOREIGN KEY (clinic_id) REFERENCES clinics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_movements (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id       CHAR(36)     NOT NULL,
  product_id      CHAR(36)     NOT NULL,
  type            ENUM('entry','exit','adjustment','waste') NOT NULL,
  quantity        DECIMAL(10,3) NOT NULL,
  unit_cost       DECIMAL(10,2) DEFAULT NULL,
  appointment_id  CHAR(36)     DEFAULT NULL,
  service_id      CHAR(36)     DEFAULT NULL,
  user_id         CHAR(36)     DEFAULT NULL,
  reason          VARCHAR(200) DEFAULT NULL,
  quantity_before DECIMAL(10,3) NOT NULL,
  quantity_after  DECIMAL(10,3) NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stock_mov_product (product_id),
  CONSTRAINT fk_stock_mov_product FOREIGN KEY (product_id) REFERENCES stock_products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: marketing_campaigns
-- ============================================================
CREATE TABLE marketing_campaigns (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id        CHAR(36)     NOT NULL,
  name             VARCHAR(150) NOT NULL,
  type             ENUM('whatsapp','email','sms','push') NOT NULL,
  status           ENUM('draft','scheduled','sending','sent','cancelled') NOT NULL DEFAULT 'draft',
  target_segment   JSON         DEFAULT NULL,
  message          TEXT         NOT NULL,
  subject          VARCHAR(200) DEFAULT NULL,
  scheduled_at     TIMESTAMP    DEFAULT NULL,
  sent_at          TIMESTAMP    DEFAULT NULL,
  total_recipients INT          NOT NULL DEFAULT 0,
  sent_count       INT          NOT NULL DEFAULT 0,
  opened_count     INT          NOT NULL DEFAULT 0,
  clicked_count    INT          NOT NULL DEFAULT 0,
  created_by       CHAR(36)     DEFAULT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_campaigns_clinic (clinic_id),
  CONSTRAINT fk_campaigns_clinic FOREIGN KEY (clinic_id) REFERENCES clinics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIEWs úteis
-- ============================================================

-- KPIs do mês por clínica
CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT
  c.id                                                           AS clinic_id,
  c.name                                                         AS clinic_name,
  COUNT(DISTINCT cl.id)                                          AS total_clients,
  COUNT(DISTINCT CASE WHEN cl.created_at >= DATE_FORMAT(NOW(),'%Y-%m-01') THEN cl.id END) AS new_clients_month,
  COUNT(DISTINCT CASE WHEN a.start_at  >= DATE_FORMAT(NOW(),'%Y-%m-01') AND a.status != 'cancelled' THEN a.id END) AS appointments_month,
  COUNT(DISTINCT CASE WHEN DATE(a.start_at) = CURDATE() AND a.status != 'cancelled' THEN a.id END) AS appointments_today,
  COALESCE(SUM(CASE WHEN ft.paid_at >= DATE_FORMAT(NOW(),'%Y-%m-01') AND ft.type = 'income' THEN ft.final_amount END), 0) AS revenue_month
FROM clinics c
LEFT JOIN clients cl ON cl.clinic_id = c.id AND cl.deleted_at IS NULL
LEFT JOIN appointments a ON a.clinic_id = c.id AND a.deleted_at IS NULL
LEFT JOIN financial_transactions ft ON ft.clinic_id = c.id AND ft.deleted_at IS NULL AND ft.status = 'paid'
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name;

-- Serviços mais vendidos
CREATE OR REPLACE VIEW v_top_services AS
SELECT
  a.clinic_id,
  s.id                AS service_id,
  s.name              AS service_name,
  s.category,
  COUNT(a.id)         AS total_appointments,
  SUM(a.final_price)  AS total_revenue,
  AVG(a.final_price)  AS avg_price
FROM appointments a
JOIN services s ON s.id = a.service_id
WHERE a.status = 'completed' AND a.deleted_at IS NULL
GROUP BY a.clinic_id, s.id, s.name, s.category;
