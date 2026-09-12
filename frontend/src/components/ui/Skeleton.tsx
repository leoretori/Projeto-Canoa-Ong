import React from 'react';
import { View } from 'react-native';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <View
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <View className="w-full bg-surface-container-lowest dark:bg-[#111c2e] p-6 rounded-3xl border border-outline-variant/30 mb-4 animate-pulse">
      <View className="flex-row items-center justify-between mb-4">
        <View className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <View className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </View>
      <View className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-3" />
      <View className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
      <View className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full mb-4" />
      <View className="flex-row justify-between items-center pt-2">
        <View className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <View className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </View>
    </View>
  );
}

