import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { makeStyles } from '@rneui/themed';
import useGymList from '@/hooks/useGymList';
import GymList from '@/components/GymList';
import { useStore } from '@/store';
import { FILTERS } from '@/constants';
import Dropdown from 'react-native-input-select';
import { colors } from '../../themed';
import type {
  GymListRowData,
  GymSearchResult,
  WoondocPriceEntry,
} from '@/types/gymSearch';

const useStyles = makeStyles(theme => ({
  container: {
    flex: 1,
    padding: 24,
    position: 'relative',
  },
  dropdown: {
    borderRadius: 100,
    borderColor: theme.colors.greyOutline,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 18,
    paddingVertical: 0,
    height: 35,
    minHeight: 35,
    borderWidth: 1,
  },
  dropdownIcon: { top: 14, right: 20 },
  dropdownLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  dropdownContainer: {
    width: 110,
  },
}));

const GymListScreen = ({ filter }: { filter: keyof typeof FILTERS }) => {
  const styles = useStyles();
  const { location } = useStore();
  const { data } = useGymList(location);
  const [gymList, setGymList] = useState<GymListRowData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const setDayPassGymList = (_data: readonly GymListRowData[] | undefined) => {
    setGymList(
      (_data ?? [])
        .map((gym: GymListRowData) => ({
          ...gym,
          gym_price_info: {
            ...gym.gym_price_info,
            day_price:
              (gym.gym_price_info?.day_price ?? 0) >= 10000
                ? gym.gym_price_info?.day_price
                : [10000, 18000, 25000, 20000, 30000][
                    Math.floor(Math.random() * 5)
                  ],
          },
        }))
        .sort((a, b) => {
          const pa = a.gym_price_info?.day_price ?? 0;
          const pb = b.gym_price_info?.day_price ?? 0;
          return pa - pb;
        }),
    );
  };

  // Props
  useEffect(() => {
    setSelectedFilter(filter);
  }, [filter]);

  useEffect(() => {
    if (data) {
      setDayPassGymList(data ?? []);
    }
  }, [data]);

  useEffect(() => {
    const rawList = data ?? [];
    if (selectedFilter === 'female') {
      setDayPassGymList(
        gymList.filter((gym: GymListRowData) => gym.for_women === true),
      );
    } else if (selectedFilter === 'dayPass') {
      setDayPassGymList(rawList);
    } else if (selectedFilter === 'membership') {
      const membershipGymList: GymListRowData[] = rawList.map(
        (gym: GymSearchResult) => ({
          ...gym,
          gym_price_info: {
            ...gym.gym_price_info,
            sortedGymPrices:
              gym.gym_price_info?.gym_price_tables?.[0]?.gym_prices
                ?.slice()
                ?.filter(
                  (price: WoondocPriceEntry) => price.price > 10000,
                )
                .sort(
                  (a: WoondocPriceEntry, b: WoondocPriceEntry) =>
                    a.times - b.times,
                ) ?? [],
          },
        }),
      );
      setGymList(membershipGymList);
    }
  }, [selectedFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScrollView style={styles.container}>
      <Dropdown
        dropdownIconStyle={styles.dropdownIcon}
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
        primaryColor={colors.primary}
        checkboxControls={{ checkboxStyle: { display: 'none' } }}
        dropdownStyle={styles.dropdown}
        labelStyle={styles.dropdownLabel}
        listComponentStyles={{
          itemSeparatorStyle: {
            height: 1,
          },
        }}
        dropdownContainerStyle={styles.dropdownContainer}
      />
      {gymList && gymList.length > 0 && (
        <GymList data={gymList} filter={selectedFilter} />
      )}
    </ScrollView>
  );
};

export default GymListScreen;
