import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { assetRepository, liabilityRepository } from '../../lib/dataAccess';
import { Asset, Liability } from '../../lib/types';

export default function HomeScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 加载数据
  const loadData = async () => {
    try {
      const [assetsData, liabilitiesData] = await Promise.all([
        assetRepository.getAll(),
        liabilityRepository.getAll()
      ]);
      setAssets(assetsData);
      setLiabilities(liabilitiesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  // 计算财务指标
  const calculateMetrics = () => {
    // 总资产
    const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
    
    // 总负债
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.balance, 0);
    
    // 净资产
    const netWorth = totalAssets - totalLiabilities;
    
    // FIRE相关资产
    const fireAssets = assets
      .filter(asset => asset.includeInFire)
      .reduce((sum, asset) => sum + asset.amount, 0);

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      fireAssets
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载数据中...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>财务概览</Text>
        <Text style={styles.subtitle}>实时掌握您的财务状况</Text>
      </View>

      <View style={styles.metricsContainer}>
        {/* 总资产 */}
        <View style={[styles.metricCard, styles.assetsCard]}>
          <Text style={styles.metricLabel}>总资产</Text>
          <Text style={styles.metricValue}>¥{metrics.totalAssets.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.metricCount}>{assets.length} 项资产</Text>
        </View>

        {/* 总负债 */}
        <View style={[styles.metricCard, styles.liabilitiesCard]}>
          <Text style={styles.metricLabel}>总负债</Text>
          <Text style={styles.metricValue}>¥{metrics.totalLiabilities.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.metricCount}>{liabilities.length} 项负债</Text>
        </View>

        {/* 净资产 */}
        <View style={[styles.metricCard, styles.netWorthCard]}>
          <Text style={styles.metricLabel}>净资产</Text>
          <Text style={styles.metricValue}>¥{metrics.netWorth.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.metricCount}>
            {metrics.netWorth >= 0 ? '财务健康' : '需要关注'}
          </Text>
        </View>

        {/* FIRE资产 */}
        <View style={[styles.metricCard, styles.fireCard]}>
          <Text style={styles.metricLabel}>FIRE资产</Text>
          <Text style={styles.metricValue}>¥{metrics.fireAssets.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.metricCount}>
            {assets.filter(a => a.includeInFire).length} 项资产
          </Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>资产分布</Text>
        <View style={styles.distributionContainer}>
          {assets.length > 0 ? (
            assets.map((asset, index) => (
              <View key={asset.id} style={styles.assetItem}>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetType}>{asset.type}</Text>
                </View>
                <Text style={styles.assetAmount}>¥{asset.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>暂无资产数据</Text>
          )}
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>负债情况</Text>
        <View style={styles.distributionContainer}>
          {liabilities.length > 0 ? (
            liabilities.map((liability, index) => (
              <View key={liability.id} style={styles.assetItem}>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{liability.name}</Text>
                  <Text style={styles.assetType}>{liability.type}</Text>
                </View>
                <Text style={styles.assetAmount}>¥{liability.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>暂无负债数据</Text>
          )}
        </View>
      </View>
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
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metricsContainer: {
    padding: 20,
    gap: 16,
  },
  metricCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  assetsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CD964',
  },
  liabilitiesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  netWorthCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  fireCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#5856D6',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  metricCount: {
    fontSize: 12,
    color: '#999',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  distributionContainer: {
    gap: 12,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  assetType: {
    fontSize: 14,
    color: '#666',
  },
  assetAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
  },
});
