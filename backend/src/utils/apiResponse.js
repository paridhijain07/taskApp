function apiResponse({ res, message, data, meta }) {
  return res.status(res.statusCode || 200).json({
    success: true,
    message,
    data: data === undefined ? null : data,
    meta: meta
      ? {
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
        }
      : undefined,
  });
}

module.exports = { apiResponse };
