# Data Management in k6

This directory contains examples of parameterized load testing using external data sources (CSV and JSON).

## CSV vs JSON: When to Use Each

### CSV - Comma Separated Values
**Best for:**
- Tabular data with rows and columns
- User credentials (username, password, email)
- Large datasets from spreadsheets or exports
- Data formatted as simple key-value pairs

**Advantages:**
- ✅ Easy to create/edit in Excel, Google Sheets
- ✅ Lightweight file format
- ✅ Good for human-readable test data
- ✅ Direct column mapping

**Disadvantages:**
- ❌ Limited to flat structures (no nested objects)
- ❌ Requires CSV parsing library
- ❌ All values are strings (must convert types manually)

**Example:**
```csv
username,password,email
john_doe,secret123,john@example.com
jane_smith,pass456,jane@example.com
bob_jones,xyz789,bob@example.com
```

### JSON - JavaScript Object Notation
**Best for:**
- Complex nested objects (products with categories, pricing tiers)
- Configuration data with metadata
- Data that needs type preservation (numbers, booleans, nested arrays)
- API response mocking

**Advantages:**
- ✅ Supports nested structures and arrays
- ✅ Native type support (numbers, booleans, null)
- ✅ No parsing library needed (built-in JSON support)
- ✅ Easier to represent complex relationships

**Disadvantages:**
- ❌ Harder to edit in spreadsheet tools
- ❌ Slightly larger file size
- ❌ Manual JSON formatting required

**Example:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Laptop",
      "category": "electronics",
      "price": 999.99,
      "in_stock": true
    },
    {
      "id": 2,
      "name": "Mouse",
      "category": "accessories",
      "price": 29.99,
      "in_stock": true
    }
  ]
}
```

## Data Assignment Strategies

### 1. Round-Robin (Recommended for Load Testing)
Each VU cycles through the data set sequentially.

```javascript
const dataIndex = __VU % data.length;
const row = data[dataIndex];
```

**When to use:** Most load tests - distributes load evenly across different data sets

### 2. Per-VU Assignment
Each VU gets a unique data entry (VU 1 → row 1, VU 2 → row 2).

```javascript
const dataIndex = (__VU - 1) % data.length;
const row = data[dataIndex];
```

**When to use:** When you want each VU to have isolated data, no collision risk

### 3. Sequential Iteration-Based
Each test iteration uses next data entry.

```javascript
const dataIndex = scenario.iterationInTest % data.length;
const row = data[dataIndex];
```

**When to use:** When you want to progress through data sequentially

## Critical: Use SharedArray

Always use `SharedArray` to load data. Without it, each VU copies the entire dataset into memory, causing massive memory overhead.

**❌ BAD - Creates N copies of data (one per VU):**
```javascript
const data = JSON.parse(open('./data.json'));
```

**✅ GOOD - Single shared reference:**
```javascript
import { SharedArray } from 'k6/data';

const data = new SharedArray('data', function () {
  return JSON.parse(open('./data.json'));
});
```

## Usage Examples

### Run with CSV Data
```bash
k6 run --env DATA_FILE=./data/users.csv csv-users.js
```

### Run with Custom Base URL
```bash
k6 run \
  --env DATA_FILE=./data/users.csv \
  --env BASE_URL=https://api.example.com \
  csv-users.js
```

### Run with Dashboard
```bash
K6_WEB_DASHBOARD=true k6 run \
  --env DATA_FILE=./data/products.json \
  json-products.js
```

## Sample Data Files

### users.csv
```csv
username,password,email
admin,admin123,admin@test.com
user1,pass1,user1@test.com
user2,pass2,user2@test.com
testuser,testpass,test@test.com
```

### products.json
```json
{
  "products": [
    {"id": 101, "name": "Widget", "category": "general", "price": 19.99},
    {"id": 102, "name": "Gadget", "category": "electronics", "price": 49.99},
    {"id": 103, "name": "Tool", "category": "tools", "price": 9.99}
  ]
}
```

## Best Practices

1. **Always use `SharedArray`** - Prevents memory explosion in distributed testing
2. **Validate data before test** - Check CSV/JSON files are valid before running
3. **Use environment variables** - Pass file paths via `__ENV.DATA_FILE`
4. **Handle missing data** - Add null checks if data loading fails
5. **Consider data sensitivity** - Never commit actual user credentials, use test data
6. **Size appropriately** - For N VUs, ensure you have enough data rows (at least N/10)
