/**
 * TEST FILE FOR ALL MODELS
 * Kiểm tra tất cả Models: UserModel, VehicleModel, CostModel, LocationModel, 
 * NoteModel, ReviewModel, MaintenanceModel, BaseModel
 * 
 * Chạy: node test-models.js
 */

const db = require('./config/database');

// Import tất cả Models
const BaseModel = require('./models/BaseModel');
const UserModel = require('./models/UserModel');
const VehicleModel = require('./models/VehicleModel');
const CostModel = require('./models/CostModel');
const LocationModel = require('./models/LocationModel');
const NoteModel = require('./models/NoteModel');
const ReviewModel = require('./models/ReviewModel');
const MaintenanceModel = require('./models/MaintenanceModel');

// ============================================
// TEST UTILITIES
// ============================================

class TestRunner {
  constructor() {
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async test(testName, testFn) {
    this.totalTests++;
    try {
      await testFn();
      this.passedTests++;
      this.results.push({ name: testName, status: '✅ PASS', error: null });
      console.log(`  ✅ ${testName}`);
    } catch (error) {
      this.failedTests++;
      this.results.push({ name: testName, status: '❌ FAIL', error: error.message });
      console.log(`  ❌ ${testName}`);
      console.log(`     Error: ${error.message}`);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(2)}%`);
    console.log('='.repeat(60) + '\n');
  }
}

// ============================================
// TESTS
// ============================================

async function runAllTests() {
  const runner = new TestRunner();

  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING ALL MODELS');
  console.log('='.repeat(60) + '\n');

  // ==================== BaseModel Tests ====================
  console.log('📝 BaseModel Tests');
  await runner.test('BaseModel should initialize with table name', () => {
    const model = new BaseModel(db, 'test_table');
    if (model.tableName !== 'test_table') throw new Error('Table name not set');
    if (!model.db) throw new Error('Database not set');
  });

  await runner.test('BaseModel should have findAll method', () => {
    const model = new BaseModel(db, 'account');
    if (typeof model.findAll !== 'function') throw new Error('findAll method not found');
  });

  await runner.test('BaseModel should have findById method', () => {
    const model = new BaseModel(db, 'account');
    if (typeof model.findById !== 'function') throw new Error('findById method not found');
  });

  await runner.test('BaseModel should have delete method', () => {
    const model = new BaseModel(db, 'account');
    if (typeof model.delete !== 'function') throw new Error('delete method not found');
  });

  await runner.test('BaseModel should have exists method', () => {
    const model = new BaseModel(db, 'account');
    if (typeof model.exists !== 'function') throw new Error('exists method not found');
  });

  // ==================== UserModel Tests ====================
  console.log('\n📝 UserModel Tests');
  await runner.test('UserModel should initialize with "account" table', () => {
    const userModel = new UserModel(db);
    if (userModel.tableName !== 'account') throw new Error('Wrong table name');
  });

  await runner.test('UserModel should have listAllForAdmin method', () => {
    const userModel = new UserModel(db);
    if (typeof userModel.listAllForAdmin !== 'function') {
      throw new Error('listAllForAdmin method not found');
    }
  });

  await runner.test('UserModel should have findByUsername method', () => {
    const userModel = new UserModel(db);
    if (typeof userModel.findByUsername !== 'function') {
      throw new Error('findByUsername method not found');
    }
  });

  await runner.test('UserModel should have createAccount method', () => {
    const userModel = new UserModel(db);
    if (typeof userModel.createAccount !== 'function') {
      throw new Error('createAccount method not found');
    }
  });

  await runner.test('UserModel should have updatePassword method', () => {
    const userModel = new UserModel(db);
    if (typeof userModel.updatePassword !== 'function') {
      throw new Error('updatePassword method not found');
    }
  });

  await runner.test('UserModel should have grantAdmin method', () => {
    const userModel = new UserModel(db);
    if (typeof userModel.grantAdmin !== 'function') {
      throw new Error('grantAdmin method not found');
    }
  });

  // ==================== VehicleModel Tests ====================
  console.log('\n📝 VehicleModel Tests');
  await runner.test('VehicleModel should initialize with "phuong_tien" table', () => {
    const vehicleModel = new VehicleModel(db);
    if (vehicleModel.tableName !== 'phuong_tien') throw new Error('Wrong table name');
  });

  await runner.test('VehicleModel should have findByAccountId method', () => {
    const vehicleModel = new VehicleModel(db);
    if (typeof vehicleModel.findByAccountId !== 'function') {
      throw new Error('findByAccountId method not found');
    }
  });

  await runner.test('VehicleModel should have create method', () => {
    const vehicleModel = new VehicleModel(db);
    if (typeof vehicleModel.create !== 'function') throw new Error('create method not found');
  });

  await runner.test('VehicleModel should have update method', () => {
    const vehicleModel = new VehicleModel(db);
    if (typeof vehicleModel.update !== 'function') throw new Error('update method not found');
  });

  await runner.test('VehicleModel should have deleteSecure method', () => {
    const vehicleModel = new VehicleModel(db);
    if (typeof vehicleModel.deleteSecure !== 'function') {
      throw new Error('deleteSecure method not found');
    }
  });

  // ==================== CostModel Tests ====================
  console.log('\n📝 CostModel Tests');
  await runner.test('CostModel should initialize with "chi_phi_dich_vu" table', () => {
    const costModel = new CostModel(db);
    if (costModel.tableName !== 'chi_phi_dich_vu') throw new Error('Wrong table name');
  });

  await runner.test('CostModel should have findByVehicleId method', () => {
    const costModel = new CostModel(db);
    if (typeof costModel.findByVehicleId !== 'function') {
      throw new Error('findByVehicleId method not found');
    }
  });

  await runner.test('CostModel should have createCost method', () => {
    const costModel = new CostModel(db);
    if (typeof costModel.createCost !== 'function') {
      throw new Error('createCost method not found');
    }
  });

  await runner.test('CostModel should have getStatistics method', () => {
    const costModel = new CostModel(db);
    if (typeof costModel.getStatistics !== 'function') {
      throw new Error('getStatistics method not found');
    }
  });

  // ==================== LocationModel Tests ====================
  console.log('\n📝 LocationModel Tests');
  await runner.test('LocationModel should initialize with "tramsac" table', () => {
    const locationModel = new LocationModel(db);
    if (locationModel.tableName !== 'tramsac') throw new Error('Wrong table name');
  });

  await runner.test('LocationModel should have tableMap with location types', () => {
    const locationModel = new LocationModel(db);
    const expectedTypes = ['tramsac', 'ttsc', 'baidoxe', 'ttdk'];
    expectedTypes.forEach(type => {
      if (!locationModel.tableMap[type]) throw new Error(`Missing table for ${type}`);
    });
  });

  await runner.test('LocationModel should have getAllByType method', () => {
    const locationModel = new LocationModel(db);
    if (typeof locationModel.getAllByType !== 'function') {
      throw new Error('getAllByType method not found');
    }
  });

  await runner.test('LocationModel should have create method', () => {
    const locationModel = new LocationModel(db);
    if (typeof locationModel.create !== 'function') throw new Error('create method not found');
  });

  await runner.test('LocationModel should have getFields method', () => {
    const locationModel = new LocationModel(db);
    if (typeof locationModel.getFields !== 'function') {
      throw new Error('getFields method not found');
    }
  });

  // ==================== NoteModel Tests ====================
  console.log('\n📝 NoteModel Tests');
  await runner.test('NoteModel should initialize with "luu_y_ca_nhan" table', () => {
    const noteModel = new NoteModel(db);
    if (noteModel.tableName !== 'luu_y_ca_nhan') throw new Error('Wrong table name');
  });

  await runner.test('NoteModel should have findByAccountId method', () => {
    const noteModel = new NoteModel(db);
    if (typeof noteModel.findByAccountId !== 'function') {
      throw new Error('findByAccountId method not found');
    }
  });

  await runner.test('NoteModel should have createNote method', () => {
    const noteModel = new NoteModel(db);
    if (typeof noteModel.createNote !== 'function') {
      throw new Error('createNote method not found');
    }
  });

  await runner.test('NoteModel should have updateNote method', () => {
    const noteModel = new NoteModel(db);
    if (typeof noteModel.updateNote !== 'function') {
      throw new Error('updateNote method not found');
    }
  });

  // ==================== ReviewModel Tests ====================
  console.log('\n📝 ReviewModel Tests');
  await runner.test('ReviewModel should initialize with "danhgia_tramsac" table', () => {
    const reviewModel = new ReviewModel(db);
    if (reviewModel.tableName !== 'danhgia_tramsac') throw new Error('Wrong table name');
  });

  await runner.test('ReviewModel should have tableMap with review types', () => {
    const reviewModel = new ReviewModel(db);
    const expectedTypes = ['tramsac', 'ttsc', 'baidoxe', 'ttdk'];
    expectedTypes.forEach(type => {
      if (!reviewModel.tableMap[type]) throw new Error(`Missing table for ${type}`);
    });
  });

  await runner.test('ReviewModel should have getByLocation method', () => {
    const reviewModel = new ReviewModel(db);
    if (typeof reviewModel.getByLocation !== 'function') {
      throw new Error('getByLocation method not found');
    }
  });

  await runner.test('ReviewModel should have create method', () => {
    const reviewModel = new ReviewModel(db);
    if (typeof reviewModel.create !== 'function') throw new Error('create method not found');
  });

  // ==================== MaintenanceModel Tests ====================
  console.log('\n📝 MaintenanceModel Tests');
  await runner.test('MaintenanceModel should initialize with "bao_duong_dang_kiem" table', () => {
    const maintenanceModel = new MaintenanceModel(db);
    if (maintenanceModel.tableName !== 'bao_duong_dang_kiem') throw new Error('Wrong table name');
  });

  await runner.test('MaintenanceModel should have findByVehicleId method', () => {
    const maintenanceModel = new MaintenanceModel(db);
    if (typeof maintenanceModel.findByVehicleId !== 'function') {
      throw new Error('findByVehicleId method not found');
    }
  });

  await runner.test('MaintenanceModel should have create method', () => {
    const maintenanceModel = new MaintenanceModel(db);
    if (typeof maintenanceModel.create !== 'function') {
      throw new Error('create method not found');
    }
  });

  await runner.test('MaintenanceModel should have updateSecure method', () => {
    const maintenanceModel = new MaintenanceModel(db);
    if (typeof maintenanceModel.updateSecure !== 'function') {
      throw new Error('updateSecure method not found');
    }
  });

  // ==================== Print Results ====================
  runner.printSummary();

  // Kết thúc kết nối
  process.exit(runner.failedTests === 0 ? 0 : 1);
}

// ============================================
// RUN TESTS
// ============================================

runAllTests().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  process.exit(1);
});
