import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { liabilityRepository, paymentRepository } from '../../lib/dataAccess';
import { Liability, Payment } from '../../lib/types';

export default function LiabilitiesScreen() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'loan',
    currency: 'CNY',
    balance: '',
    interestRate: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // 加载负债数据
  const loadLiabilities = async () => {
    try {
      const [liabilitiesData, paymentsData] = await Promise.all([
        liabilityRepository.getAll(),
        paymentRepository.getAll()
      ]);
      setLiabilities(liabilitiesData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading liabilities:', error);
      Alert.alert('错误', '加载负债数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadLiabilities();
  }, []);

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    loadLiabilities();
  };

  // 打开添加负债模态框
  const openAddModal = () => {
    setEditingLiability(null);
    setFormData({
      name: '',
      type: 'loan',
      currency: 'CNY',
      balance: '',
      interestRate: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setModalVisible(true);
  };

  // 打开编辑负债模态框
  const openEditModal = (liability: Liability) => {
    setEditingLiability(liability);
    setFormData({
      name: liability.name,
      type: liability.type,
      currency: liability.currency,
      balance: liability.balance.toString(),
      interestRate: liability.interestRate?.toString() || '',
      startDate: liability.startDate || '',
      endDate: liability.endDate || '',
      notes: liability.notes || ''
    });
    setModalVisible(true);
  };

  // 打开还款模态框
  const openPaymentModal = (liability: Liability) => {
    setSelectedLiability(liability);
    setPaymentData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setPaymentModalVisible(true);
  };

  // 保存负债
  const saveLiability = async () => {
    try {
      if (!formData.name || !formData.balance) {
        Alert.alert('错误', '请填写负债名称和余额');
        return;
      }

      const liabilityData = {
        name: formData.name,
        type: formData.type,
        currency: formData.currency,
        balance: parseFloat(formData.balance),
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        notes: formData.notes || undefined
      };

      if (editingLiability) {
        await liabilityRepository.update(editingLiability.id, liabilityData);
        Alert.alert('成功', '负债更新成功');
      } else {
        await liabilityRepository.create(liabilityData);
        Alert.alert('成功', '负债添加成功');
      }

      setModalVisible(false);
      loadLiabilities();
    } catch (error) {
      console.error('Error saving liability:', error);
      Alert.alert('错误', '保存负债失败');
    }
  };

  // 记录还款
  const recordPayment = async () => {
    try {
      if (!selectedLiability || !paymentData.amount) {
        Alert.alert('错误', '请填写还款金额');
        return;
      }

      const amount = parseFloat(paymentData.amount);
      if (amount > selectedLiability.balance) {
        Alert.alert('错误', '还款金额不能大于负债余额');
        return;
      }

      // 创建还款记录
      await paymentRepository.create({
        liabilityId: selectedLiability.id,
        amount,
        date: paymentData.date,
        notes: paymentData.notes || undefined
      });

      // 更新负债余额
      await liabilityRepository.update(selectedLiability.id, {
        balance: selectedLiability.balance - amount
      });

      Alert.alert('成功', '还款记录成功');
      setPaymentModalVisible(false);
      loadLiabilities();
    } catch (error) {
      console.error('Error recording payment:', error);
      Alert.alert('错误', '记录还款失败');
    }
  };

  // 删除负债
  const deleteLiability = (liability: Liability) => {
    Alert.alert(
      '确认删除',
      `确定要删除负债 "${liability.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await liabilityRepository.delete(liability.id);
              Alert.alert('成功', '负债删除成功');
              loadLiabilities();
            } catch (error) {
              console.error('Error deleting liability:', error);
              Alert.alert('错误', '删除负债失败');
            }
          }
        }
      ]
    );
  };

  // 获取负债的还款记录
  const getLiabilityPayments = (liabilityId: string): Payment[] => {
    return payments.filter(payment => payment.liabilityId === liabilityId);
  };

  // 渲染负债项
  const renderLiabilityItem = ({ item }: { item: Liability }) => {
    const liabilityPayments = getLiabilityPayments(item.id);
    const totalPaid = liabilityPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return (
      <View style={styles.liabilityCard}>
        <View style={styles.liabilityHeader}>
          <View style={styles.liabilityInfo}>
            <Text style={styles.liabilityName}>{item.name}</Text>
            <Text style={styles.liabilityType}>{item.type}</Text>
          </View>
          <View style={styles.liabilityActions}>
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={() => openPaymentModal(item)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#4CD964" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="pencil-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteLiability(item)}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.liabilityDetails}>
          <Text style={styles.liabilityBalance}>¥{item.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <View style={styles.liabilityMeta}>
            <Text style={styles.liabilityCurrency}>{item.currency}</Text>
            {item.interestRate && (
              <Text style={styles.interestRate}>利率: {item.interestRate}%</Text>
            )}
          </View>
        </View>
        {liabilityPayments.length > 0 && (
          <View style={styles.paymentsSummary}>
            <Text style={styles.paymentsCount}>已还款 {liabilityPayments.length} 次，总计 ¥{totalPaid.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载负债数据中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>负债管理</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={liabilities}
        renderItem={renderLiabilityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.liabilityList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>暂无负债数据</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>添加第一个负债</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      />

      {/* 添加/编辑负债模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLiability ? '编辑负债' : '添加负债'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>负债名称 *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="请输入负债名称"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>负债类型</Text>
                <TextInput
                  style={styles.input}
                  value={formData.type}
                  onChangeText={(text) => setFormData({ ...formData, type: text })}
                  placeholder="如：loan, credit_card"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>币种</Text>
                <TextInput
                  style={styles.input}
                  value={formData.currency}
                  onChangeText={(text) => setFormData({ ...formData, currency: text })}
                  placeholder="如：CNY, USD"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>余额 *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.balance}
                  onChangeText={(text) => setFormData({ ...formData, balance: text })}
                  placeholder="请输入余额"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>利率</Text>
                <TextInput
                  style={styles.input}
                  value={formData.interestRate}
                  onChangeText={(text) => setFormData({ ...formData, interestRate: text })}
                  placeholder="请输入年利率"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>备注</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="请输入备注信息"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveLiability}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 记录还款模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>记录还款</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedLiability && (
                <View style={styles.liabilityInfoCard}>
                  <Text style={styles.liabilityInfoName}>{selectedLiability.name}</Text>
                  <Text style={styles.liabilityInfoBalance}>当前余额: ¥{selectedLiability.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>还款金额 *</Text>
                <TextInput
                  style={styles.input}
                  value={paymentData.amount}
                  onChangeText={(text) => setPaymentData({ ...paymentData, amount: text })}
                  placeholder="请输入还款金额"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>还款日期</Text>
                <TextInput
                  style={styles.input}
                  value={paymentData.date}
                  onChangeText={(text) => setPaymentData({ ...paymentData, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>备注</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={paymentData.notes}
                  onChangeText={(text) => setPaymentData({ ...paymentData, notes: text })}
                  placeholder="请输入备注信息"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={recordPayment}
              >
                <Text style={styles.saveButtonText}>记录还款</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FF3B30',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liabilityList: {
    padding: 20,
    gap: 16,
  },
  liabilityCard: {
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
  liabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  liabilityInfo: {
    flex: 1,
  },
  liabilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  liabilityType: {
    fontSize: 14,
    color: '#666',
  },
  liabilityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  liabilityDetails: {
    marginBottom: 8,
  },
  liabilityBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  liabilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liabilityCurrency: {
    fontSize: 14,
    color: '#666',
  },
  interestRate: {
    fontSize: 14,
    color: '#FF9500',
  },
  paymentsSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paymentsCount: {
    fontSize: 14,
    color: '#4CD964',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
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
  liabilityInfoCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  liabilityInfoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  liabilityInfoBalance: {
    fontSize: 14,
    color: '#666',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  button: {
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
});
