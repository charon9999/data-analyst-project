"""
Exploratory Data Analysis Script
Data: Data_Analysis.xlsx
Author: Claude
Date: 2026-02-11
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set visualization style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)

# ============================================================================
# 1. DATA LOADING
# ============================================================================

def load_data(file_path):
    """Load Excel file and return DataFrame"""
    print("="*80)
    print("LOADING DATA")
    print("="*80)
    
    xl_file = pd.ExcelFile(file_path)
    print(f"Available sheets: {xl_file.sheet_names}")
    
    # Load the first sheet
    df = pd.read_excel(file_path, sheet_name=xl_file.sheet_names[0])
    print(f"\nLoaded sheet: {xl_file.sheet_names[0]}")
    print(f"Data shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    return df

# ============================================================================
# 2. DATA OVERVIEW
# ============================================================================

def basic_info(df):
    """Display basic information about the dataset"""
    print("\n" + "="*80)
    print("DATA OVERVIEW")
    print("="*80)
    
    print("\nFirst 5 rows:")
    print(df.head())
    
    print("\n\nLast 5 rows:")
    print(df.tail())
    
    print("\n\nDataset Shape:")
    print(f"Rows: {df.shape[0]}")
    print(f"Columns: {df.shape[1]}")
    
    print("\n\nColumn Names:")
    for i, col in enumerate(df.columns, 1):
        print(f"{i}. {col}")
    
    print("\n\nData Types:")
    print(df.dtypes)
    
    print("\n\nMemory Usage:")
    print(df.memory_usage(deep=True).sum() / 1024**2, "MB")

# ============================================================================
# 3. MISSING VALUES ANALYSIS
# ============================================================================

def missing_values_analysis(df):
    """Analyze missing values in the dataset"""
    print("\n" + "="*80)
    print("MISSING VALUES ANALYSIS")
    print("="*80)
    
    # Calculate missing values
    missing = pd.DataFrame({
        'Column': df.columns,
        'Missing_Count': df.isnull().sum(),
        'Missing_Percentage': (df.isnull().sum() / len(df) * 100).round(2)
    })
    
    missing = missing[missing['Missing_Count'] > 0].sort_values('Missing_Count', ascending=False)
    
    if len(missing) > 0:
        print("\nColumns with missing values:")
        print(missing.to_string(index=False))
        
        # Visualize missing values
        plt.figure(figsize=(10, 6))
        plt.barh(missing['Column'], missing['Missing_Percentage'])
        plt.xlabel('Missing Percentage (%)')
        plt.title('Missing Values by Column')
        plt.tight_layout()
        plt.savefig('/mnt/user-data/outputs/missing_values.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("\n✓ Missing values chart saved to: missing_values.png")
    else:
        print("\n✓ No missing values found in the dataset!")

# ============================================================================
# 4. NUMERICAL FEATURES ANALYSIS
# ============================================================================

def numerical_analysis(df):
    """Analyze numerical columns"""
    print("\n" + "="*80)
    print("NUMERICAL FEATURES ANALYSIS")
    print("="*80)
    
    # Select numerical columns
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    print(f"\nNumerical columns ({len(numerical_cols)}):")
    for col in numerical_cols:
        print(f"  • {col}")
    
    print("\n\nDescriptive Statistics:")
    print(df[numerical_cols].describe().round(2))
    
    # Distribution plots
    n_cols = len(numerical_cols)
    if n_cols > 0:
        n_rows = (n_cols + 2) // 3
        fig, axes = plt.subplots(n_rows, 3, figsize=(15, 5*n_rows))
        axes = axes.flatten() if n_cols > 1 else [axes]
        
        for idx, col in enumerate(numerical_cols):
            if idx < len(axes):
                df[col].hist(bins=30, ax=axes[idx], edgecolor='black')
                axes[idx].set_title(f'Distribution of {col}')
                axes[idx].set_xlabel(col)
                axes[idx].set_ylabel('Frequency')
        
        # Hide empty subplots
        for idx in range(len(numerical_cols), len(axes)):
            axes[idx].axis('off')
        
        plt.tight_layout()
        plt.savefig('/mnt/user-data/outputs/numerical_distributions.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("\n✓ Numerical distributions chart saved to: numerical_distributions.png")
    
    # Correlation matrix
    if len(numerical_cols) > 1:
        plt.figure(figsize=(12, 10))
        correlation = df[numerical_cols].corr()
        sns.heatmap(correlation, annot=True, fmt='.2f', cmap='coolwarm', center=0,
                    square=True, linewidths=1, cbar_kws={"shrink": 0.8})
        plt.title('Correlation Matrix of Numerical Features')
        plt.tight_layout()
        plt.savefig('/mnt/user-data/outputs/correlation_matrix.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("✓ Correlation matrix saved to: correlation_matrix.png")

# ============================================================================
# 5. CATEGORICAL FEATURES ANALYSIS
# ============================================================================

def categorical_analysis(df):
    """Analyze categorical columns"""
    print("\n" + "="*80)
    print("CATEGORICAL FEATURES ANALYSIS")
    print("="*80)
    
    # Select categorical columns
    categorical_cols = df.select_dtypes(include=['object', 'str']).columns.tolist()
    
    print(f"\nCategorical columns ({len(categorical_cols)}):")
    for col in categorical_cols:
        print(f"  • {col}")
    
    print("\n\nUnique Values Count:")
    for col in categorical_cols:
        unique_count = df[col].nunique()
        print(f"  {col}: {unique_count} unique values")
    
    # Value counts for each categorical column
    print("\n\nTop Values per Categorical Column:")
    for col in categorical_cols:
        if df[col].nunique() < 50:  # Only show if reasonable number of categories
            print(f"\n{col}:")
            print(df[col].value_counts().head(10))
    
    # Visualize top categorical columns
    cols_to_plot = [col for col in categorical_cols if 2 <= df[col].nunique() <= 20]
    
    if len(cols_to_plot) > 0:
        n_cols_plot = min(len(cols_to_plot), 6)
        n_rows = (n_cols_plot + 1) // 2
        fig, axes = plt.subplots(n_rows, 2, figsize=(15, 5*n_rows))
        axes = axes.flatten() if n_cols_plot > 1 else [axes]
        
        for idx, col in enumerate(cols_to_plot[:n_cols_plot]):
            value_counts = df[col].value_counts().head(10)
            axes[idx].barh(range(len(value_counts)), value_counts.values)
            axes[idx].set_yticks(range(len(value_counts)))
            axes[idx].set_yticklabels(value_counts.index)
            axes[idx].set_xlabel('Count')
            axes[idx].set_title(f'Top Values: {col}')
            axes[idx].invert_yaxis()
        
        # Hide empty subplots
        for idx in range(n_cols_plot, len(axes)):
            axes[idx].axis('off')
        
        plt.tight_layout()
        plt.savefig('/mnt/user-data/outputs/categorical_distributions.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("\n✓ Categorical distributions chart saved to: categorical_distributions.png")

# ============================================================================
# 6. DOMAIN-SPECIFIC ANALYSIS (E-COMMERCE DATA)
# ============================================================================

def domain_analysis(df):
    """Perform domain-specific analysis for e-commerce data"""
    print("\n" + "="*80)
    print("DOMAIN-SPECIFIC ANALYSIS (E-COMMERCE)")
    print("="*80)
    
    # Sales Analysis
    if 'Discounted Total' in df.columns:
        total_revenue = df['Discounted Total'].sum()
        avg_order_value = df['Discounted Total'].mean()
        print(f"\nTotal Revenue: ${total_revenue:,.2f}")
        print(f"Average Order Value: ${avg_order_value:,.2f}")
    
    # Order Status Analysis
    if 'Status' in df.columns:
        print("\n\nOrder Status Distribution:")
        print(df['Status'].value_counts())
    
    # Return Analysis
    if 'Return?' in df.columns:
        return_rate = (df['Return?'] == 'Yes').sum() / len(df) * 100
        print(f"\n\nReturn Rate: {return_rate:.2f}%")
        
        if 'Reason' in df.columns:
            print("\nReturn Reasons:")
            print(df[df['Return?'] == 'Yes']['Reason'].value_counts())
    
    # Category Analysis
    if 'Category' in df.columns and 'Discounted Total' in df.columns:
        print("\n\nRevenue by Category:")
        category_revenue = df.groupby('Category')['Discounted Total'].agg(['sum', 'mean', 'count'])
        category_revenue.columns = ['Total_Revenue', 'Avg_Order_Value', 'Order_Count']
        category_revenue = category_revenue.sort_values('Total_Revenue', ascending=False)
        print(category_revenue)
        
        # Visualize
        fig, axes = plt.subplots(1, 2, figsize=(15, 6))
        
        category_revenue['Total_Revenue'].plot(kind='bar', ax=axes[0])
        axes[0].set_title('Total Revenue by Category')
        axes[0].set_xlabel('Category')
        axes[0].set_ylabel('Revenue ($)')
        axes[0].tick_params(axis='x', rotation=45)
        
        category_revenue['Order_Count'].plot(kind='bar', ax=axes[1])
        axes[1].set_title('Order Count by Category')
        axes[1].set_xlabel('Category')
        axes[1].set_ylabel('Number of Orders')
        axes[1].tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        plt.savefig('/mnt/user-data/outputs/category_analysis.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("\n✓ Category analysis chart saved to: category_analysis.png")
    
    # Payment Method Analysis
    if 'Payment' in df.columns:
        print("\n\nPayment Method Distribution:")
        print(df['Payment'].value_counts())
    
    # Geographic Analysis
    if 'State' in df.columns and 'Discounted Total' in df.columns:
        print("\n\nTop 10 States by Revenue:")
        state_revenue = df.groupby('State')['Discounted Total'].sum().sort_values(ascending=False).head(10)
        print(state_revenue)
        
        # Visualize
        plt.figure(figsize=(12, 6))
        state_revenue.plot(kind='barh')
        plt.title('Top 10 States by Revenue')
        plt.xlabel('Revenue ($)')
        plt.ylabel('State')
        plt.tight_layout()
        plt.savefig('/mnt/user-data/outputs/state_analysis.png', dpi=300, bbox_inches='tight')
        plt.close()
        print("\n✓ State analysis chart saved to: state_analysis.png")

# ============================================================================
# 7. OUTLIER DETECTION
# ============================================================================

def outlier_detection(df):
    """Detect outliers using IQR method"""
    print("\n" + "="*80)
    print("OUTLIER DETECTION")
    print("="*80)
    
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    print("\nOutliers detected using IQR method:")
    outlier_summary = []
    
    for col in numerical_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
        outlier_count = len(outliers)
        outlier_percentage = (outlier_count / len(df)) * 100
        
        if outlier_count > 0:
            outlier_summary.append({
                'Column': col,
                'Outlier_Count': outlier_count,
                'Outlier_Percentage': round(outlier_percentage, 2),
                'Lower_Bound': round(lower_bound, 2),
                'Upper_Bound': round(upper_bound, 2)
            })
    
    if outlier_summary:
        outlier_df = pd.DataFrame(outlier_summary)
        print(outlier_df.to_string(index=False))
        
        # Create box plots
        cols_to_plot = [item['Column'] for item in outlier_summary[:6]]
        if cols_to_plot:
            n_cols = len(cols_to_plot)
            n_rows = (n_cols + 2) // 3
            fig, axes = plt.subplots(n_rows, 3, figsize=(15, 5*n_rows))
            axes = axes.flatten() if n_cols > 1 else [axes]
            
            for idx, col in enumerate(cols_to_plot):
                df.boxplot(column=col, ax=axes[idx])
                axes[idx].set_title(f'Box Plot: {col}')
            
            for idx in range(len(cols_to_plot), len(axes)):
                axes[idx].axis('off')
            
            plt.tight_layout()
            plt.savefig('/mnt/user-data/outputs/outlier_boxplots.png', dpi=300, bbox_inches='tight')
            plt.close()
            print("\n✓ Outlier box plots saved to: outlier_boxplots.png")
    else:
        print("\n✓ No significant outliers detected!")

# ============================================================================
# 8. DATA QUALITY REPORT
# ============================================================================

def data_quality_report(df):
    """Generate comprehensive data quality report"""
    print("\n" + "="*80)
    print("DATA QUALITY REPORT")
    print("="*80)
    
    quality_report = []
    
    for col in df.columns:
        missing_count = df[col].isnull().sum()
        missing_pct = (missing_count / len(df)) * 100
        unique_count = df[col].nunique()
        dtype = df[col].dtype
        
        quality_report.append({
            'Column': col,
            'Data_Type': str(dtype),
            'Missing_Count': missing_count,
            'Missing_%': round(missing_pct, 2),
            'Unique_Values': unique_count,
            'Completeness_%': round(100 - missing_pct, 2)
        })
    
    quality_df = pd.DataFrame(quality_report)
    print("\n", quality_df.to_string(index=False))
    
    # Save to CSV
    quality_df.to_csv('/mnt/user-data/outputs/data_quality_report.csv', index=False)
    print("\n✓ Data quality report saved to: data_quality_report.csv")

# ============================================================================
# 9. SUMMARY STATISTICS EXPORT
# ============================================================================

def export_summary_stats(df):
    """Export summary statistics to CSV"""
    print("\n" + "="*80)
    print("EXPORTING SUMMARY STATISTICS")
    print("="*80)
    
    # Numerical summary
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if numerical_cols:
        numerical_summary = df[numerical_cols].describe()
        numerical_summary.to_csv('/mnt/user-data/outputs/numerical_summary.csv')
        print("\n✓ Numerical summary saved to: numerical_summary.csv")
    
    # Categorical summary
    categorical_cols = df.select_dtypes(include=['object', 'str']).columns.tolist()
    if categorical_cols:
        cat_summary = []
        for col in categorical_cols:
            cat_summary.append({
                'Column': col,
                'Unique_Count': df[col].nunique(),
                'Most_Frequent': df[col].mode()[0] if len(df[col].mode()) > 0 else 'N/A',
                'Most_Frequent_Count': df[col].value_counts().iloc[0] if len(df[col].value_counts()) > 0 else 0
            })
        cat_df = pd.DataFrame(cat_summary)
        cat_df.to_csv('/mnt/user-data/outputs/categorical_summary.csv', index=False)
        print("✓ Categorical summary saved to: categorical_summary.csv")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main function to run all analyses"""
    print("\n" + "="*80)
    print("EXPLORATORY DATA ANALYSIS")
    print("="*80)
    print(f"Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Load data
    file_path = '/mnt/user-data/uploads/Data_Analysis.xlsx'
    df = load_data(file_path)
    
    # Run analyses
    basic_info(df)
    missing_values_analysis(df)
    numerical_analysis(df)
    categorical_analysis(df)
    domain_analysis(df)
    outlier_detection(df)
    data_quality_report(df)
    export_summary_stats(df)
    
    print("\n" + "="*80)
    print("ANALYSIS COMPLETE!")
    print("="*80)
    print("\nAll outputs saved to: /mnt/user-data/outputs/")
    print("\nGenerated files:")
    print("  • missing_values.png")
    print("  • numerical_distributions.png")
    print("  • correlation_matrix.png")
    print("  • categorical_distributions.png")
    print("  • category_analysis.png")
    print("  • state_analysis.png")
    print("  • outlier_boxplots.png")
    print("  • data_quality_report.csv")
    print("  • numerical_summary.csv")
    print("  • categorical_summary.csv")
    print("\n" + "="*80)

if __name__ == "__main__":
    main()
