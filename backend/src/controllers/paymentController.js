import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Payment from "../models/Payment.js";

export const createOrder = async (req,res)=>{

  const {amount,purpose,subscriptionId} = req.body;

  const options = {
    amount: amount * 100,
    currency: "INR"
  };

  const order = await razorpay.orders.create(options);

  const payment = await Payment.create({
    studentId:req.user._id,
    amount,
    orderId:order.id,
    purpose,
    subscriptionId
  });

  res.json({
    success:true,
    order,
    payment
  });

};

export const verifyPayment = async (req,res)=>{

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const sign = crypto
  .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
  .update(razorpay_order_id + "|" + razorpay_payment_id)
  .digest("hex");

  if(sign !== razorpay_signature){
    return res.status(400).json({message:"Invalid signature"});
  }

  const payment = await Payment.findOne({
    orderId:razorpay_order_id
  });

  payment.status="paid";
  payment.paymentId=razorpay_payment_id;

  await payment.save();

  res.json({
    success:true,
    message:"Payment verified"
  });

};

export const getPaymentHistory = async (req,res)=>{

  const payments = await Payment.find({
    studentId:req.user._id
  });

  res.json({
    success:true,
    data:payments
  });

};

export const getPaymentById = async (req,res)=>{

  const payment = await Payment.findById(req.params.id);

  res.json({
    success:true,
    data:payment
  });

};

export const getAllPayments = async(req,res)=>{

  const page = Number(req.query.page) || 1;
  const limit = 10;

  const payments = await Payment.find()
  .skip((page-1)*limit)
  .limit(limit)
  .populate("studentId","name email");

  res.json({
    success:true,
    page,
    data:payments
  });

};
export const refundPayment = async (req,res)=>{

  const payment = await Payment.findById(req.params.id);

  await razorpay.payments.refund(payment.paymentId);

  payment.status="refunded";

  await payment.save();

  res.json({
    success:true,
    message:"Refund successful"
  });

};