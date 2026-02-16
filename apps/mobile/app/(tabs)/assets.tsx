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
import { assetRepository } from '../../lib/dataAccess';
import { Asset } from '../../lib/types';

export default function AssetsScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    currency: 'CNY',
    amount: '',
    includeInFire: true,
    accountId: '',
    quantity: '',
    unitPrice: '',
    interestRate: '',
    startDate: '',
    endDate: '',
    valuationMethod: 'MANUAL',
    notes: ''
  });

  // 加载资产数据
  const loadAssets = async () => {
    try {
      const data = await assetRepository.getAll();
      setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
      Alert.alert('错误', '加载资产数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadAssets();
  }, []);

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    loadAssets();
  };

  // 打开添加资产模态框
  const openAddModal = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      type: 'cash',
      currency: 'CNY',
      amount: '',
      includeInFire: true,
      accountId: '',
      quantity: '',
      unitPrice: '',
      interestRate: '',
      startDate: '',
      endDate: '',
      valuationMethod: 'MANUAL',
      notes: ''
    });
    setModalVisible(true);
  };

  // 打开编辑资产模态框
  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      currency: asset.currency,
      amount: asset.amount.toString(),
      includeInFire: asset.includeInFire,
      accountId: asset.accountId || '',
      quantity: asset.quantity?.toString() || '',
      unitPrice: asset.unitPrice?.toString() || '',
      interestRate: asset.interestRate?.toString() || '',
      startDate: asset.startDate || '',
      endDate: asset.endDate || '',
      valuationMethod: asset.valuationMethod,
      notes: asset.notes || ''
    });
    setModalVisible(true);
  };

  // 保存资产
  const saveAsset = async () => {
    try {
      if (!formData.name || !formData.amount) {
        Alert.alert('错误', '请填写资产名称和金额');
        return;
      }

      const assetData = {
        name: formData.name,
        type: formData.type,
        currency: formData.currency,
        amount: parseFloat(formData.amount),
        includeInFire: formData.includeInFire,
        accountId: formData.accountId || undefined,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        valuationMethod: formData.valuationMethod,
        notes: formData.notes || undefined
      };

      if (editingAsset) {
        await assetRepository.update(editingAsset.id, assetData);
        Alert.alert('成功', '资产更新成功');
      } else {
        await assetRepository.create(assetData);
        Alert.alert('成功', '资产添加成功');
      }

      setModalVisible(false);
      loadAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      Alert.alert('错误', '保存资产失败');
    }
  };

  // 删除资产
  const deleteAsset = (asset: Asset) => {
    Alert.alert(
      '确认删除',
      `确定要删除资产 "${asset.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await assetRepository.delete(asset.id);
              Alert.alert('成功', '资产删除成功');
              loadAssets();
            } catch (error) {
              console.error('Error deleting asset:', error);
              Alert.alert('错误', '删除资产失败');
            }
          }
        }
      ]
    );
  };

  // 渲染资产项
  const renderAssetItem = ({ item }: { item: Asset }) => {
    return (
      <TouchableOpacity
        style={styles.assetCard}
        onPress={() => openEditModal(item)}
      >
        <View style={styles.assetHeader}>
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{item.name}</Text>
            <Text style={styles.assetType}>{item.type}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteAsset(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <View style={styles.assetDetails}>
          <Text style={styles.assetAmount}>¥{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <View style={styles.assetMeta}>
            <Text style={styles.assetCurrency}>{item.currency}</Text>
            {item.includeInFire && (
              <View style={styles.fireBadge}>
                <Text style={styles.fireText}>FIRE</Text>
              </View>
            )}
          </View>
        </View>
        {item.interestRate && (
          <Text style={styles.interestRate}>利率: {item.interestRate}%</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载资产数据中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>资产管理</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.assetList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>暂无资产数据</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>添加第一个资产</Text>
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

      {/* 添加/编辑资产模态框 */}
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
                {editingAsset ? '编辑资产' : '添加资产'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>资产名称 *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="请输入资产名称"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>资产类型</Text>
                <TextInput
                  style={styles.input}
                  value={formData.type}
                  onChangeText={(text) => setFormData({ ...formData, type: text })}
                  placeholder="如：cash, stock, real_estate"
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
                <Text style={styles.label}>包含在FIRE计算中</Text>
                <TouchableOpacity
                  style={[styles.switch, formData.includeInFire && styles.switchActive]}
                  onPress={() => setFormData({ ...formData, includeInFire: !formData.includeInFire })}
                >
                  <View style={[styles.switchThumb, formData.includeInFire && styles.switchThumbActive]} />
                </TouchableOpacity>
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
                onPress={saveAsset}
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
    backgroundColor: '#007AFF',
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
  assetList: {
    padding: 20,
    gap: 16,
  },
  assetCard: {
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
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  assetType: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  assetDetails: {
    marginBottom: 8,
  },
  assetAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  assetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetCurrency: {
    fontSize: 14,
    color: '#666',
  },
  fireBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fireText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  interestRate: {
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
    backgroundColor: '#007AFF',
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
  switch: {
    width: 50,
    height: 30,
    backgroundColor: '#ddd',
    borderRadius: 15,
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#4CD964',
  },
  switchThumb: {
    width: 26,
    height: 26,
    backgroundColor: '#fff',
    borderRadius: 13,
  },
  switchThumbActive: {
    marginLeft: 20,
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
