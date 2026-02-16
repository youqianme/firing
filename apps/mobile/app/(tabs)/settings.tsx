import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userSettingsRepository, fireConfigRepository } from '../../lib/dataAccess';
import { UserSettings, FireConfig } from '../../lib/types';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [fireConfig, setFireConfig] = useState<FireConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [fireModalVisible, setFireModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [fireFormData, setFireFormData] = useState({
    annualExpense: '',
    swr: '4'
  });
  const [selectedCurrency, setSelectedCurrency] = useState('CNY');

  // 加载设置数据
  const loadSettings = async () => {
    try {
      const [settingsData, fireConfigData] = await Promise.all([
        userSettingsRepository.get(),
        fireConfigRepository.get()
      ]);
      setSettings(settingsData);
      setFireConfig(fireConfigData);
      if (fireConfigData) {
        setFireFormData({
          annualExpense: fireConfigData.annualExpense.toString(),
          swr: (fireConfigData.swr * 100).toString()
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('错误', '加载设置数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadSettings();
  }, []);

  // 切换隐私模式
  const togglePrivacyMode = async () => {
    if (!settings) return;

    try {
      const updatedSettings = await userSettingsRepository.update({
        privacyMode: !settings.privacyMode
      });
      setSettings(updatedSettings);
      Alert.alert('成功', '隐私模式设置已更新');
    } catch (error) {
      console.error('Error updating privacy mode:', error);
      Alert.alert('错误', '更新隐私模式失败');
    }
  };

  // 保存FIRE配置
  const saveFireConfig = async () => {
    try {
      if (!fireFormData.annualExpense) {
        Alert.alert('错误', '请填写年度支出');
        return;
      }

      const configData = {
        annualExpense: parseFloat(fireFormData.annualExpense),
        swr: parseFloat(fireFormData.swr) / 100
      };

      const updatedConfig = await fireConfigRepository.upsert(configData);
      setFireConfig(updatedConfig);
      setFireModalVisible(false);
      Alert.alert('成功', 'FIRE配置已更新');
    } catch (error) {
      console.error('Error saving FIRE config:', error);
      Alert.alert('错误', '保存FIRE配置失败');
    }
  };

  // 保存基础货币
  const saveCurrency = async () => {
    if (!settings) return;

    try {
      const updatedSettings = await userSettingsRepository.update({
        baseCurrency: selectedCurrency
      });
      setSettings(updatedSettings);
      setCurrencyModalVisible(false);
      Alert.alert('成功', '基础货币已更新');
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert('错误', '更新基础货币失败');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载设置数据中...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>无法加载设置数据</Text>
      </View>
    );
  }

  // 计算FIRE目标金额
  const calculateFireTarget = () => {
    if (!fireConfig) return 0;
    return fireConfig.annualExpense / fireConfig.swr;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>设置</Text>
        <Text style={styles.subtitle}>个性化您的财务配置</Text>
      </View>

      {/* FIRE配置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FIRE 配置</Text>
        <View style={styles.card}>
          {fireConfig ? (
            <>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>年度支出</Text>
                <Text style={styles.settingValue}>¥{fireConfig.annualExpense.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>安全提款率 (SWR)</Text>
                <Text style={styles.settingValue}>{(fireConfig.swr * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>FIRE 目标金额</Text>
                <Text style={styles.settingValue}>¥{calculateFireTarget().toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setFireFormData({
                    annualExpense: fireConfig.annualExpense.toString(),
                    swr: (fireConfig.swr * 100).toString()
                  });
                  setFireModalVisible(true);
                }}
              >
                <Text style={styles.buttonText}>编辑 FIRE 配置</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.emptyText}>还未设置 FIRE 配置</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setFireModalVisible(true)}
              >
                <Text style={styles.buttonText}>设置 FIRE 配置</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* 基础货币 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基础货币</Text>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>当前基础货币</Text>
            <Text style={styles.settingValue}>{settings.baseCurrency}</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setSelectedCurrency(settings.baseCurrency);
              setCurrencyModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>更改基础货币</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 隐私设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>隐私设置</Text>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>隐私模式</Text>
            <Switch
              value={settings.privacyMode}
              onValueChange={togglePrivacyMode}
              trackColor={{ false: '#ddd', true: '#4CD964' }}
              thumbColor={settings.privacyMode ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.settingDescription}>
            隐私模式开启后，敏感财务数据将被隐藏
          </Text>
        </View>
      </View>

      {/* 关于 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>版本</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>开发者</Text>
            <Text style={styles.settingValue}>有钱么团队</Text>
          </View>
        </View>
      </View>

      {/* FIRE配置模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fireModalVisible}
        onRequestClose={() => setFireModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>FIRE 配置</Text>
              <TouchableOpacity onPress={() => setFireModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>年度支出 *</Text>
                <TextInput
                  style={styles.input}
                  value={fireFormData.annualExpense}
                  onChangeText={(text) => setFireFormData({ ...fireFormData, annualExpense: text })}
                  placeholder="请输入年度支出"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>安全提款率 (SWR) %</Text>
                <TextInput
                  style={styles.input}
                  value={fireFormData.swr}
                  onChangeText={(text) => setFireFormData({ ...fireFormData, swr: text })}
                  placeholder="如：4"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setFireModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveFireConfig}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 货币选择模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={currencyModalVisible}
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择基础货币</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {['CNY', 'USD', 'EUR', 'JPY', 'GBP'].map(currency => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.currencyOption,
                    selectedCurrency === currency && styles.currencyOptionSelected
                  ]}
                  onPress={() => setSelectedCurrency(currency)}
                >
                  <Text style={[
                    styles.currencyOptionText,
                    selectedCurrency === currency && styles.currencyOptionTextSelected
                  ]}>
                    {currency}
                  </Text>
                  {selectedCurrency === currency && (
                    <Ionicons name="checkmark" size={24} color="#4CD964" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCurrencyModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveCurrency}
              >
                <Text style={styles.saveButtonText}>确认</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyOptionSelected: {
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
  },
  currencyOptionText: {
    fontSize: 16,
    color: '#000',
  },
  currencyOptionTextSelected: {
    fontWeight: 'bold',
    color: '#4CD964',
  },
});
