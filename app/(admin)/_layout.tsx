import React from 'react'
import { Text, View } from 'react-native'

export default function AdminLayout({ children }: any) {
  return (
    <View>
      <Text>Admin Layout</Text>
      {children}
    </View>
  )
}
