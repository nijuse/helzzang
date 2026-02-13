import { useEffect, useState } from 'react';
import { View } from 'react-native';
import useGymList from '../hooks/useGymList';
import GymList from '../components/GymList';
import { useStore } from '../store';
import { FILTERS } from '../constants';
import Dropdown from 'react-native-input-select';
// import Icon from 'react-native-vector-icons/MaterialIcons';

const GymListScreen = ({ filter }: { filter: keyof typeof FILTERS }) => {
  const { location } = useStore();
  const { data } = useGymList(location);
  const [gymList, setGymList] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  useEffect(() => {
    if (data) {
      setGymList(
        data.map((gym: any) => ({
          ...gym,
          price: {
            dayPass: [10000, 18000, 25000, 20000, 30000][
              Math.floor(Math.random() * 5)
            ].toLocaleString(),
          },
        })),
      );
    }
  }, [data]);

  useEffect(() => {
    setSelectedFilter(filter);
  }, [filter]);
  return (
    <View style={{ position: 'relative' }}>
      <Dropdown
        dropdownIconStyle={{ top: 30, right: 20 }}
        autoCloseOnSelect={true}
        checkboxControls={{ checkboxStyle: { display: 'none' } }}
        dropdownStyle={{
          borderRadius: 100,
          borderColor: '#E0E0E0',
          backgroundColor: '#fff',
          paddingHorizontal: 20,
          paddingVertical: 5,
          height: 30,
          borderWidth: 1,
        }}
        dropdownContainerStyle={{
          width: 120,
        }}
        options={[
          { label: FILTERS.dayPass, value: 'dayPass' },
          { label: FILTERS.membership, value: 'membership' },
          { label: FILTERS.female, value: 'female' },
        ]}
        selectedValue={selectedFilter}
        onValueChange={value =>
          setSelectedFilter(value as keyof typeof FILTERS)
        }
        primaryColor={'#2089dc'}
      />
      {gymList && gymList.length > 0 && <GymList data={gymList} />}
    </View>
  );
};

export default GymListScreen;
