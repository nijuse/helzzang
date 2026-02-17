import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import useGymList from '../hooks/useGymList';
import GymList from '../components/GymList';
import { useStore } from '../store';
import { FILTERS } from '../constants';
import Dropdown from 'react-native-input-select';

const GymListScreen = ({ filter }: { filter: keyof typeof FILTERS }) => {
  const { location } = useStore();
  const { data } = useGymList(location);
  const [gymList, setGymList] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const setDaypassGymList = (_data: any[]) => {
    setGymList(
      _data
        .map((gym: any) => ({
          ...gym,
          gym_price_info: {
            ...gym.gym_price_info,
            day_price:
              gym?.gym_price_info?.day_price >= 10000
                ? gym?.gym_price_info?.day_price
                : [10000, 18000, 25000, 20000, 30000][
                    Math.floor(Math.random() * 5)
                  ],
          },
        }))
        .sort(
          (a: any, b: any) =>
            a.gym_price_info.day_price - b.gym_price_info.day_price,
        ),
    );
  };

  // Props
  useEffect(() => {
    setSelectedFilter(filter);
  }, [filter]);

  useEffect(() => {
    if (data) {
      setDaypassGymList(data);
    }
  }, [data]);

  useEffect(() => {
    if (selectedFilter === 'female') {
      setDaypassGymList(gymList.filter((gym: any) => gym.for_women === true));
    } else if (selectedFilter === 'dayPass') {
      setDaypassGymList(data);
    }
  }, [selectedFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScrollView style={{ position: 'relative' }}>
      <Dropdown
        dropdownIconStyle={{ top: 14, right: 20 }}
        autoCloseOnSelect={true}
        selectedValue={selectedFilter}
        options={[
          { label: FILTERS.dayPass, value: 'dayPass' },
          { label: FILTERS.membership, value: 'membership' },
          { label: FILTERS.female, value: 'female' },
        ]}
        onValueChange={value =>
          setSelectedFilter(value as keyof typeof FILTERS)
        }
        primaryColor={'#2089dc'}
        checkboxControls={{ checkboxStyle: { display: 'none' } }}
        dropdownStyle={{
          borderRadius: 100,
          borderColor: '#E0E0E0',
          backgroundColor: '#fff',
          paddingHorizontal: 18,
          paddingVertical: 0,
          height: 35,
          minHeight: 35,
          borderWidth: 1,
        }}
        labelStyle={{
          fontSize: 14,
          lineHeight: 20,
        }}
        listComponentStyles={{
          itemSeparatorStyle: {
            height: 1,
          },
        }}
        dropdownContainerStyle={{
          width: 110,
        }}
      />
      {gymList && gymList.length > 0 && (
        <GymList data={gymList} filter={selectedFilter} />
      )}
    </ScrollView>
  );
};

export default GymListScreen;
