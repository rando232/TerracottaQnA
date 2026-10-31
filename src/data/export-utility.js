/**
 * NexusQA Data Export Utility
 * 
 * Run this in the browser console while the app is running to export all data.
 * The data will be downloaded as JSON files.
 */

function exportNexusQAData() {
  console.log('🚀 Starting NexusQA data export...');

  // Helper function to download JSON
  function downloadJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`✅ Downloaded: ${filename}`);
  }

  // Export all datasets
  const datasets = [
    { key: 'nexusqa_users', filename: 'users.json' },
    { key: 'nexusqa_documents', filename: 'documents.json' },
    { key: 'nexusqa_categories', filename: 'categories.json' },
    { key: 'nexusqa_tags', filename: 'tags.json' },
    { key: 'nexusqa_searchLogs', filename: 'search_logs.json' },
    { key: 'nexusqa_systemLogs', filename: 'system_logs.json' },
    { key: 'nexusqa_platformSettings', filename: 'platform_settings.json' }
  ];

  let successCount = 0;
  
  datasets.forEach(({ key, filename }) => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        downloadJSON(parsed, filename);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed to export ${filename}:`, err);
      }
    } else {
      console.warn(`⚠️  No data found for ${key}`);
    }
  });

  // Export combined dataset
  const combined = {};
  datasets.forEach(({ key }) => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        combined[key.replace('nexusqa_', '')] = JSON.parse(data);
      } catch (err) {
        console.error(`Error parsing ${key}:`, err);
      }
    }
  });
  
  downloadJSON(combined, 'nexusqa_complete_dataset.json');
  console.log(`\n🎉 Export complete! Downloaded ${successCount + 1} files.`);
}

// Export function to window for easy access
window.exportNexusQAData = exportNexusQAData;

console.log('📦 NexusQA Export Utility loaded!');
console.log('💡 Run: exportNexusQAData() to download all data as JSON files');
