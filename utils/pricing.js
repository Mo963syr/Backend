function computePrice(km, {
  baseFee = 3500,      // فتح العداد
  perKm1 = 3800,      // سعر الكيلومتر لحد معين
  perKm2 = 3000,      // سعر الكيلومتر بعد الحد
  thresholdKm = 8,    // الحد الفاصل
  minFee = 12000,       // الحد الأدنى
  surge = 1.0         // زيادة (ليل/ازدحام)
} = {}) {
  const variable =
    km <= thresholdKm
      ? km * perKm1
      : (thresholdKm * perKm1) + ((km - thresholdKm) * perKm2);

  const subtotal = baseFee + variable;
  const surged = subtotal * surge;
  return Math.max(surged, minFee);
}

module.exports = { computePrice };
