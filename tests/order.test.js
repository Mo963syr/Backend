const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

const User = require('../models/user.Model');
const Part = require('../models/part.Model');
const Cart = require('../models/cart.model');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await User.deleteMany({});
  await Part.deleteMany({});
  await Cart.deleteMany({});
  await mongoose.connection.close();
});

describe('POST /order/add', () => {
  it('should create a new order successfully', async () => {
    const testUser = await User.create({
      name: 'Tester',
      phoneNumber: '0999888777',
      email: 'test@example.com',
      password: 'hashedPass',
      role: 'user',
      province: 'Damascus',
      location: {
        type: 'Point',
        coordinates: [36.2, 33.5],
      },
    });

    const testPart = await Part.create({
      name: 'Test Part',
      manufacturer: 'Kia',
      model: 'Sportage',
      year: '2020',
      fuelType: 'بنزين',
      price: 100,
      count: 10,
      category: 'محرك',
      condition: 'جديد',
      sellerId: testUser._id,
      user: testUser._id,
    });

    await Cart.create({
      userId: testUser._id,
      partId: testPart._id,
      status: 'قيد المعالجة', // ✅ لازم نفس النص اللي في الكود
    });

    const response = await request(app)
      .post('/order/add')
      .send({
        userId: testUser._id.toString(),
        coordinates: [36.2, 33.5],
        fee: 5000,
      });

    console.log('📦 Response:', response.body);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.orderId).toBeDefined();
  });
});
