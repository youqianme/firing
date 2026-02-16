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
import { transactionRepository, assetRepository } from '../../lib/dataAccess';
import { Transaction, Asset } from '../../lib/types';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    type: 'transfer',
    fromAssetId: '',
    toAssetId: '',
    amount: '',
    currency: 'CNY',
    fee: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // 加载交易数据
  const loadData = async () => {
    try {
      const [transactionsData, assetsData] = await Promise.all([
        transactionRepository.getAll(),
        assetRepository.getAll()
      ]);
      setTransactions(transactionsData);
      setAssets(assetsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('错误', '加载交易数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadData();
  }, []);

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 打开添加交易模态框
  const openAddModal = () => {
    setFormData({
      type: 'transfer',
      fromAssetId: '',
      toAssetId: '',
      amount: '',
      currency: 'CNY',
      fee: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setModalVisible(true);
  };

  // 保存交易
  const saveTransaction = async () => {
    try {
      if (!formData.amount) {
        Alert.alert('错误', '请填写交易金额');
        return;
      }

      const transactionData = {
        type: formData.type,
        fromAssetId: formData.fromAssetId || undefined,
        toAssetId: formData.toAssetId || undefined,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        fee: formData.fee ? parseFloat(formData.fee) : undefined,
        date: formData.date,
        notes: formData.notes || undefined
      };

      await transactionRepository.create(transactionData);
      Alert.alert('成功', '交易添加成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('错误', '保存交易失败');
    }
  };

  // 删除交易
  const deleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      '确认删除',
      `确定要删除交易吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionRepository.delete(transaction.id);
              Alert.alert('成功', '交易删除成功');
              loadData();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('错误', '删除交易失败');
            }
          }
        }
      ]
    );
  };

  // 获取资产名称
  const getAssetName = (assetId: string): string => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : '未知资产';
  };

  // 渲染交易项
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>{item.type}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTransaction(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionAmount}>¥{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionCurrency}>{item.currency}</Text>
            {item.fee && item.fee > 0 && (
              <Text style={styles.transactionFee}>手续费: ¥{item.fee.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            )}
          </View>
        </View>
        {item.fromAssetId && (
          <View style={styles.transactionAssets}>
            <View style={styles.assetInfo}>
              <Ionicons name="arrow-up-circle-outline" size={16} color="#FF3B30" />
              <Text style={styles.assetName}>{getAssetName(item.fromAssetId)}</Text>
            </View>
          </View>
        )}
        {item.toAssetId && (
          <View style={styles.transactionAssets}>
            <View style={styles.assetInfo}>
              <Ionicons name="arrow-down-circle-outline" size={16} color="#4CD964" />
              <Text style={styles.assetName}>{getAssetName(item.toAssetId)}</Text>
            </View>
          </View>
        )}
        {item.notes && (
          <Text style={styles.transactionNotes}>{item.notes}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载交易数据中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>交易记录</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>暂无交易记录</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>添加第一笔交易</Text>
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

      {/* 添加交易模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加交易</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>交易类型</Text>
                <TextInput
                  style={styles.input}
                  value={formData.type}
                  onChangeText={(text) => setFormData({ ...formData, type: text })}
                  placeholder="如：transfer, deposit, withdrawal"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>从资产</Text>
                <View style={styles.assetSelector}>
                  {assets.map(asset => (
                    <TouchableOpacity
                      key={asset.id}
                      style={[
                        styles.assetOption,
                        formData.fromAssetId === asset.id && styles.assetOptionSelected
                      ]}
                      onPress={() => setFormData({ ...formData, fromAssetId: asset.id })}
                    >
                      <Text style={[
                        styles.assetOptionText,
                        formData.fromAssetId === asset.id && styles.assetOptionTextSelected
                      ]}>
                        {asset.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>到资产</Text>
                <View style={styles.assetSelector}>
                  {assets.map(asset => (
                    <TouchableOpacity
                      key={asset.id}
                      style={[
                        styles.assetOption,
                        formData.toAssetId === asset.id && styles.assetOptionSelected
                      ]}
                      onPress={() => setFormData({ ...formData, toAssetId: asset.id })}
                    >
                      <Text style={[
                        styles.assetOptionText,
                        formData.toAssetId === asset.id && styles.assetOptionTextSelected
                      ]}>
                        {asset.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>金额 *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  placeholder="请输入金额"
                  keyboardType="numeric"
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
                <Text style={styles.label}>手续费</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fee}
                  onChangeText={(text) => setFormData({ ...formData, fee: text })}
                  placeholder="请输入手续费"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>交易日期</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
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
                onPress={saveTransaction}
              >
                <Text style={styles.saveButtonText}>保存</Text>
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
    backgroundColor: '#5856D6',
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
  transactionList: {
    padding: 20,
    gap: 16,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  transactionDetails: {
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5856D6',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionCurrency: {
    fontSize: 14,
    color: '#666',
  },
  transactionFee: {
    fontSize: 14,
    color: '#FF9500',
  },
  transactionAssets: {
    marginTop: 8,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetName: {
    fontSize: 14,
    color: '#666',
  },
  transactionNotes: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
    backgroundColor: '#5856D6',
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
  assetSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assetOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  assetOptionSelected: {
    backgroundColor: '#5856D6',
  },
  assetOptionText: {
    fontSize: 14,
    color: '#000',
  },
  assetOptionTextSelected: {
    color: '#fff',
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
    backgroundColor: '#5856D6',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
