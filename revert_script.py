import sys

file_path = r'c:\Users\batra\OneDrive\Desktop\bitetrack\frontend\src\pages\Ledger.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. formData state
content = content.replace('''    mealType: \'Lunch\',
    amount: \'\',
    rating: 0,
    notes: \'\'
  });''', '''    mealType: \'Lunch\',
    amount: \'\',
    calories: \'\',
    rating: 0,
    notes: \'\'
  });''')

# 2. handleSubmit payload
content = content.replace('''          body: JSON.stringify({
            items: [{ name: formData.foodName, quantity: 1 }],
            amount: Number(formData.amount || 0),''', '''          body: JSON.stringify({
            items: [{ name: formData.foodName, calories: Number(formData.calories || 0), quantity: 1 }],
            amount: Number(formData.amount || 0),''')

# 3. handleSubmit signed in mode finalRecord
content = content.replace('''          mealType: data.mealType || "Lunch",
          amount: Number(data.amount ?? 0),
          rating: Number(data.rating) || 0,''', '''          mealType: data.mealType || "Lunch",
          amount: Number(data.amount ?? (data.items?.[0]?.calories || 0)),
          calories: Number(data.items?.[0]?.calories || 0),
          rating: Number(data.rating) || 0,''')

# 4. handleSubmit guest mode finalRecord
content = content.replace('''          mealType: formData.mealType,
          amount: Number(formData.amount || 0),
          rating: Number(formData.rating) || 0,''', '''          mealType: formData.mealType,
          amount: Number(formData.amount || 0),
          calories: Number(formData.calories || 0),
          rating: Number(formData.rating) || 0,''')

# 5. handleEdit
content = content.replace('''      mealType: record.mealType,
      amount: record.amount.toString(),
      rating: record.rating || 0,''', '''      mealType: record.mealType,
      amount: record.amount.toString(),
      calories: record.calories ? String(record.calories) : '',
      rating: record.rating || 0,''')


# 7. Form input JSX
content = content.replace('''                      />
                    </div>

                    {/* Rating */}''', '''                      />
                    </div>

                    {/* Calories */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-2">
                        Calories (optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        placeholder="450"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      />
                    </div>

                    {/* Rating */}''')

# 8. Display pill JSX
content = content.replace('''                              <span className="px-3 py-1 bg-[var(--app-surface-soft)] rounded-full text-xs font-medium border border-[var(--app-border)]">
                                {record.mealType}
                              </span>
                            </div>

                            {/* Rating */}''', '''                              <span className="px-3 py-1 bg-[var(--app-surface-soft)] rounded-full text-xs font-medium border border-[var(--app-border)]">
                                {record.mealType}
                              </span>
                              {Number(record.calories || 0) > 0 && (
                                <span className="px-3 py-1 bg-[var(--app-surface-soft)] rounded-full text-xs font-medium border border-[var(--app-border)]">
                                  {Number(record.calories).toLocaleString('en-IN')} kcal
                                </span>
                              )}
                            </div>

                            {/* Rating */}''')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Restored successfully.')
