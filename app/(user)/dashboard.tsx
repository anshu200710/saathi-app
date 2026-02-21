import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
  return (
    <View className="flex-1 bg-gray-100">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        {/* Header */}
        <View className="px-6 pt-6 pb-4 bg-white">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-gray-500 text-sm">Good Morning,</Text>
              <Text className="text-2xl font-bold text-gray-900">
                Welcome, Rahul
              </Text>
            </View>

            <View className="relative">
              <Feather name="bell" size={24} color="#374151" />
              <View className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </View>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Search services or documents..."
              className="flex-1 ml-3 text-sm"
            />
          </View>
        </View>

        {/* Overview */}
        <View className="mt-6">
          <Text className="text-lg font-bold px-6 mb-3">
            Overview
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-6"
          >

            {/* Card 1 */}
            <View className="w-40 bg-blue-50 p-4 rounded-2xl mr-4">
              <View className="bg-white w-10 h-10 rounded-lg items-center justify-center mb-3">
                <Feather name="zap" size={18} color="#137fec" />
              </View>
              <Text className="text-3xl font-bold">2</Text>
              <Text className="text-xs text-gray-500">
                Active Services
              </Text>
            </View>

            {/* Card 2 */}
            <View className="w-40 bg-orange-50 p-4 rounded-2xl mr-4">
              <View className="bg-white w-10 h-10 rounded-lg items-center justify-center mb-3">
                <Feather name="clock" size={18} color="#f97316" />
              </View>
              <Text className="text-3xl font-bold">1</Text>
              <Text className="text-xs text-gray-500">
                Pending Requests
              </Text>
            </View>

            {/* Card 3 */}
            <View className="w-40 bg-emerald-50 p-4 rounded-2xl mr-6">
              <View className="bg-white w-10 h-10 rounded-lg items-center justify-center mb-3">
                <Feather name="check-circle" size={18} color="#10b981" />
              </View>
              <Text className="text-3xl font-bold">14</Text>
              <Text className="text-xs text-gray-500">
                Completed
              </Text>
            </View>

          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-bold mb-4">
            Quick Actions
          </Text>

          <View className="flex-row flex-wrap justify-between">

            {[
              { icon: "plus-circle", label: "Request Service" },
              { icon: "upload-cloud", label: "Upload Docs" },
              { icon: "calculator", label: "GST Calculator" },
              { icon: "headphones", label: "Help Support" },
              { icon: "bar-chart-2", label: "My Reports" },
              { icon: "more-horizontal", label: "View More" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                className="w-[30%] items-center mb-6"
              >
                <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-2">
                  <Feather name={item.icon as any} size={26} color="#137fec" />
                </View>
                <Text className="text-xs text-center text-gray-600">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

          </View>
        </View>

        {/* Promo Banner */}
        <View className="mx-6 mt-6 bg-primary rounded-2xl p-6">
          <Text className="text-white text-lg font-bold mb-2">
            Tax Season Sale!
          </Text>
          <Text className="text-blue-100 text-sm mb-4">
            Get 20% off on premium assisted filing plans.
          </Text>
          <TouchableOpacity className="bg-white py-2 px-4 rounded-full self-start">
            <Text className="text-primary font-semibold">
              Upgrade Now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-bold mb-4">
            Recent Activity
          </Text>

          {[1,2,3].map((item) => (
            <View
              key={item}
              className="flex-row items-center bg-white p-4 rounded-xl mb-4"
            >
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
                <Feather name="file-text" size={18} color="#137fec" />
              </View>

              <View className="flex-1">
                <Text className="font-semibold text-sm">
                  GST Filing Submitted
                </Text>
                <Text className="text-xs text-gray-500">
                  March 2024 Return
                </Text>
              </View>

              <Text className="text-xs text-primary">
                Processing
              </Text>
            </View>
          ))}

        </View>

      </ScrollView>
    </View>
  );
}