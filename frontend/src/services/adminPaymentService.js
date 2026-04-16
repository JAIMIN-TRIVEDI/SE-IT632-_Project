import api from '../api/api'

const normalizePayment = (payment) => {
  return {
    id: payment._id,
    transactionId: payment.transactionId,
    tenantName: payment.tenantName,
    tenantEmail: payment.tenantEmail,
    hostelName: payment.hostelName,
    roomNumber: payment.roomNumber,
    date: payment.date,
    amount: Number(payment.amount || 0),
    status: payment.status || 'pending',
    type: payment.type || 'other',
    purpose: payment.purpose || '--',
    paymentMethod: payment.paymentMethod || '--',
  }
}

export const fetchAdminPayments = async ({
  page = 1,
  limit = 10,
  search = '',
  status = 'all',
  type = 'all',
  fromDate,
  toDate,
} = {}) => {
  const response = await api.get('/admin/payments', {
    params: {
      page,
      limit,
      search,
      status,
      type,
      fromDate,
      toDate,
    },
  })

  const payload = response.data || {}
  const rows = Array.isArray(payload.data) ? payload.data : []

  return {
    data: rows.map(normalizePayment),
    page: Number(payload.page || page),
    limit: Number(payload.limit || limit),
    total: Number(payload.total || 0),
    totalPages: Number(payload.totalPages || 1),
    metrics: {
      totalRevenue: Number(payload.metrics?.totalRevenue || 0),
      pendingDues: Number(payload.metrics?.pendingDues || 0),
      activeSubscriptions: Number(payload.metrics?.activeSubscriptions || 0),
    },
  }
}
